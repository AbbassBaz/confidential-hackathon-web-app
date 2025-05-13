import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LockIcon, UserIcon, LogoutIcon } from './icons';
import '../styles/common.css';

// App text constants
const APP_NAME = 'Confidential';
const APP_DESCRIPTION = 'Share messages securely and privately';
const NAV_ITEMS = {
  dashboard: 'Dashboard',
  create_message: 'Create Message',
  login: 'Login',
  logout: 'Logout'
};

const Layout = () => {
  const { currentUser, logout: handleAuthLogout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await handleAuthLogout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation */}
      <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg">
        <div className="nav-container">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 
                  onClick={() => navigate('/')} 
                  className="text-white text-2xl font-bold cursor-pointer flex items-center"
                >
                  <LockIcon className="icon-lg mr-2" />
                  {APP_NAME}
                </h1>
              </div>
            </div>

            <div className="flex items-center">
              {currentUser ? (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="btn-ghost"
                  >
                    {NAV_ITEMS.dashboard}
                  </button>
                  <button
                    onClick={() => navigate('/create')}
                    className="btn-primary"
                  >
                    {NAV_ITEMS.create_message}
                  </button>
                  <div className="user-info">
                    <UserIcon className="icon-sm text-white/80 mr-2" />
                    <span className="text-sm text-white/80">
                      {currentUser.email}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="btn-ghost flex items-center"
                  >
                    <LogoutIcon className="icon-sm mr-2 text-white" />
                    {NAV_ITEMS.logout}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="btn-primary"
                >
                  {NAV_ITEMS.login}
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow container mx-auto container-padding py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="nav-container">
          <div className="flex flex-col items-center">
            <div className="flex items-center space-x-2 mb-4">
              <LockIcon className="icon-md text-indigo-600" />
              <span className="text-gray-600 font-medium">{APP_NAME}</span>
            </div>
            <p className="text-gray-500 text-sm text-center">
              {APP_DESCRIPTION}<br />
              © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;