import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, deleteDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth, signInAnonymously } from 'firebase/auth';
import Timer from '../components/Timer';
import languages from '../constants/languages';
import { 
  LockIcon,
  ErrorIcon,
  ArrowLeftIcon,
  WarningIcon,
  EyeIcon,
  AttachmentIcon,
  ClockIcon,
  SpinnerIcon
} from '../components/icons';

const { loading, error, access, secure_message, attachments } = languages.view;
const { not_found, load_failed, expired, view_limit, no_permission, process_failed } = languages.view.error;
const { title: accessTitle, subtitle, email } = languages.view.access;
const { 
  title: messageTitle, 
  view_info: { 
    self_destruct: selfDestructInfo,
    normal: normalInfo,
    current_views: currentViewsInfo,
    self_destruct_timer: selfDestructTimerInfo
  }, 
  warning: { 
    self_destruct: selfDestructWarning, 
    timer_warning: timerWarning 
  }, 
  buttons 
} = languages.view.secure_message;
const { title: attachmentsTitle } = languages.view.attachments;

const View = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [message, setMessage] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [accessVerified, setAccessVerified] = useState(false);
  const [expiryTime, setExpiryTime] = useState(null);
  
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    if (!userEmail || !userEmail.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    
    if (message) {
      if (message.allowedRecipients && message.allowedRecipients.length > 0) {
        if (!message.allowedRecipients.includes(userEmail.toLowerCase())) {
          const emailDomain = '@' + userEmail.split('@')[1];
          if (!message.allowedDomains.some(domain => 
            emailDomain.toLowerCase().endsWith(domain.toLowerCase()))) {
            setError('You do not have permission to view this message');
            return;
          }
        }
      } else if (message.allowedDomains && message.allowedDomains.length > 0) {
        const emailDomain = '@' + userEmail.split('@')[1];
        if (!message.allowedDomains.some(domain => 
          emailDomain.toLowerCase().endsWith(domain.toLowerCase()))) {
          setError('You do not have permission to view this message');
          return;
        }
      }
      
      setEmailVerified(true);
      setError('');
    }
  };
  
  const handleViewMessage = async () => {
    try {
      const messageRef = doc(db, 'messages', id);
      
      if (message.selfDestruct) {
        await deleteDoc(messageRef);
      } else {
        await updateDoc(messageRef, {
          viewCount: increment(1),
          status: message.viewCount + 1 >= message.viewLimit ? 'expired' : 'active'
        });
      }
      
      setAccessVerified(true);
    } catch (error) {
      console.error('Error updating message:', error);
      setError('Failed to process message view');
    }
  };

  const handleTimerExpire = async () => {
    try {
      const messageRef = doc(db, 'messages', id);
      await deleteDoc(messageRef);
      setMessage(null);
      setError(expired);
    } catch (err) {
      console.error('Error deleting message:', err);
    }
  };

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const auth = getAuth();
        await signInAnonymously(auth);
        
        const messageRef = doc(db, 'messages', id);
        const docSnap = await getDoc(messageRef);
        
        if (docSnap.exists()) {
          const messageData = { id: docSnap.id, ...docSnap.data() };
          
          if (messageData.status === 'expired' || messageData.viewCount >= messageData.viewLimit) {
            setError('This message has expired or reached its view limit');
            setLoading(false);
            return;
          }
          
          if (messageData.createdAt) {
            const creationTime = messageData.createdAt.toDate();
            const expirationTime = new Date(creationTime.getTime() + messageData.expirationMinutes * 60000);
            
            if (new Date() > expirationTime) {
              setError('This message has expired');
              
              await updateDoc(messageRef, {
                status: 'expired'
              });
              
              setLoading(false);
              return;
            }
          }
          
          const hasAccessControl = (
            (messageData.allowedRecipients && messageData.allowedRecipients.length > 0) || 
            (messageData.allowedDomains && messageData.allowedDomains.length > 0)
          );
          
          if (!hasAccessControl) {
            setEmailVerified(true);
          }
          
          if (messageData.selfDestruct && messageData.selfDestructTimer && !messageData.timerStarted) {
            const expiryTime = new Date(Date.now() + (messageData.selfDestructTimer * 1000));
            await updateDoc(messageRef, {
              timerStarted: true,
              timerExpiryTime: expiryTime.toISOString()
            });
            setExpiryTime(expiryTime.toISOString());
          } else if (messageData.timerExpiryTime) {
            setExpiryTime(messageData.timerExpiryTime);
          }
          
          setMessage(messageData);
        } else {
          setError('Message not found');
        }
      } catch (error) {
        console.error('Error fetching message:', error);
        setError('Failed to load message');
      } finally {
        setLoading(false);
      }
    };

    fetchMessage();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading secure message...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-center mb-6">
                <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
                  <ErrorIcon className="h-8 w-8 text-red-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Error</h2>
              <p className="text-center text-gray-600 mb-6">{error}</p>
              <button 
                onClick={() => navigate('/')} 
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <ArrowLeftIcon />
                Return Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!emailVerified && message) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
            <div className="p-8">
              <div className="flex items-center justify-center mb-6">
                <div className="h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center">
                  <LockIcon className="h-8 w-8 text-indigo-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Access Verification</h2>
              <p className="text-center text-gray-600 mb-8">
                Please enter your email address to view this secure message.
              </p>
              
              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                
                {error && (
                  <div className="rounded-lg bg-red-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <ErrorIcon />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-800">{error}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <button
                  type="submit"
                  className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Verify Access
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (emailVerified && !accessVerified && message) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
            <div className="p-8">
              <div className="flex items-center justify-center mb-6">
                <div className="h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center">
                  <LockIcon className="h-8 w-8 text-indigo-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Secure Message</h2>
              <div className="text-center space-y-4 mb-8">
                <p className="text-gray-600">
                  This message {message.selfDestruct ? 'will self-destruct' : 'can be viewed'} {message.viewLimit} time{message.viewLimit !== 1 ? 's' : ''}.
                </p>
                <p className="text-gray-600">
                  Current views: {message.viewCount} / {message.viewLimit}
                </p>
              </div>
              
              {message.selfDestruct && (
                <div className="mb-4 p-4 bg-yellow-50 rounded-lg">
                  <div className="flex">
                    <WarningIcon className="h-5 w-5 text-yellow-400" />
                    <p className="ml-3 text-sm text-yellow-700">{selfDestructWarning}</p>
                  </div>
                </div>
              )}
              
              {message.selfDestructTimer && (
                <div className="mb-4 p-4 bg-yellow-50 rounded-lg">
                  <div className="flex">
                    <WarningIcon className="h-5 w-5 text-yellow-400" />
                    <p className="ml-3 text-sm text-yellow-700">{timerWarning}</p>
                  </div>
                </div>
              )}
              
              <button
                onClick={handleViewMessage}
                className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <EyeIcon />
                {message.selfDestruct ? 'View and Destroy Message' : 'View Message'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (message && accessVerified) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <LockIcon />
                Secure Message
              </h2>
              {expiryTime && (
                <div className="flex flex-col items-end">
                  <p className="text-sm text-gray-500 mb-2">
                    {selfDestructTimerInfo}
                  </p>
                  <Timer expiryTime={expiryTime} onExpire={handleTimerExpire} />
                  <p className="text-xs text-red-600 mt-2">
                    {timerWarning}
                  </p>
                </div>
              )}
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-8 whitespace-pre-wrap text-gray-800">
              {message.message}
            </div>
            
            {message.attachments && message.attachments.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Attachments</h3>
                <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-200">
                  {message.attachments.map((file, index) => (
                    <div key={index} className="p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <AttachmentIcon />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <div className="ml-4">
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Download
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-8">
              {message.selfDestruct && accessVerified ? (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <ErrorIcon />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-800">
                        This message will be destroyed after you close this page.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <ClockIcon />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-800">
                        This message will expire after {message.viewLimit} view(s) or after {message.expirationMinutes} minutes from creation.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center text-gray-500">
        Message not available
      </div>
    </div>
  );
};

export default View;