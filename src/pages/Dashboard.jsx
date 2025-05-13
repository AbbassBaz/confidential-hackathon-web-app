import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import MessageCard from '../components/MessageCard';
import { useNavigate } from 'react-router-dom';
import { 
  PlusIcon, 
  SearchIcon, 
  SpinnerIcon,
  FilterIcon,
  DocumentIcon,
  EyeIcon,
  ClockIcon,
  TrashIcon
} from '../components/icons';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, expired
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentUser) return;

      try {
        const messagesRef = collection(db, 'messages');
        const q = query(messagesRef, where('userId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        const messageList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setMessages(messageList);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [currentUser]);

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'messages', id));
      setMessages(messages.filter(message => message.id !== id));
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const filteredMessages = messages
    .filter(message => {
      if (filter === 'active') return message.status === 'active';
      if (filter === 'expired') return message.status === 'expired';
      return true;
    })
    .filter(message =>
      message.message.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const stats = {
    total: messages.length,
    active: messages.filter(m => m.status === 'active').length,
    expired: messages.filter(m => m.status === 'expired').length,
    views: messages.reduce((acc, m) => acc + (m.viewCount || 0), 0)
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <SpinnerIcon className="w-12 h-12 text-indigo-600" />
        <p className="mt-4 text-gray-600">Loading your secure messages...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Secure Messages</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and track your secure communications
          </p>
        </div>
        <button
          onClick={() => navigate('/create')}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create New Message
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <DocumentIcon className="h-8 w-8 text-indigo-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Messages</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Messages</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <TrashIcon className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Expired Messages</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.expired}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <EyeIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Views</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.views}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search messages..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <FilterIcon className="h-5 w-5 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg"
          >
            <option value="all">All Messages</option>
            <option value="active">Active Only</option>
            <option value="expired">Expired Only</option>
          </select>
        </div>
      </div>

      {/* Messages Grid */}
      {messages.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No messages yet</h3>
          <p className="mt-2 text-sm text-gray-500">Get started by creating your first secure message.</p>
          <button
            onClick={() => navigate('/create')}
            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Your First Message
          </button>
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <SearchIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No matching messages</h3>
          <p className="mt-2 text-sm text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMessages.map((message) => (
            <MessageCard 
              key={message.id} 
              message={message} 
              onDelete={handleDelete} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;