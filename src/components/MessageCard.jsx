import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AttachmentIcon, ClipboardIcon, TrashIcon } from './icons';

const MessageCard = ({ message, onDelete }) => {
  const navigate = useNavigate();
  const [copySuccess, setCopySuccess] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Generate the sharable link
  const shareableLink = `${window.location.origin}/view/${message.id}`;
  
  // Format created date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate();
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  // Handle copy link to clipboard
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableLink);
    setCopySuccess('Copied!');
    setTimeout(() => setCopySuccess(''), 2000);
  };
  
  // Handle delete confirmation
  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };
  
  // Confirm delete
  const confirmDelete = () => {
    onDelete(message.id);
    setShowDeleteConfirm(false);
  };
  
  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };
  
  // Determine status color
  const getStatusColor = () => {
    switch(message.status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-yellow-100 text-yellow-800';
      case 'destroyed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get message preview (first 50 characters)
  const getMessagePreview = () => {
    if (!message.message) return 'No content';
    return message.message.length > 50 
      ? message.message.substring(0, 50) + '...' 
      : message.message;
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Card content */}
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor()}`}>
              {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
            </span>
            <span className="text-sm text-gray-500">
              {message.viewCount}/{message.viewLimit} views
            </span>
          </div>
          <div className="text-sm text-gray-500">
            {message.createdAt && formatDate(message.createdAt)}
          </div>
        </div>
        
        <div className="mt-2">
          <p className="text-gray-800 text-sm font-medium">
            {getMessagePreview()}
          </p>
        </div>
        
        <div className="mt-4 flex items-center space-x-2">
          {message.attachments && message.attachments.length > 0 && (
            <div className="text-sm text-gray-500 flex items-center">
              <AttachmentIcon className="h-4 w-4 mr-1" />
              {message.attachments.length} attachment{message.attachments.length !== 1 ? 's' : ''}
            </div>
          )}
          
          {message.selfDestruct && (
            <div className="text-sm text-red-500 flex items-center">
              <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Self-destructs
            </div>
          )}
        </div>
      </div>
      
      {/* Card footer with actions */}
      <div className="bg-gray-50 px-5 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {copySuccess ? copySuccess : (
              <>
                <ClipboardIcon />
                Copy Link
              </>
            )}
          </button>
        </div>
        
        <div>
          <button
            onClick={handleDelete}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <TrashIcon />
            Delete
          </button>
        </div>
      </div>
      
      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-auto">
            <h3 className="text-lg font-medium text-gray-900">Delete Message</h3>
            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to delete this message? This action cannot be undone.
            </p>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={cancelDelete}
                className="inline-flex justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="inline-flex justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageCard;