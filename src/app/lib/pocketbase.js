// lib/pocketbase.js
import PocketBase from 'pocketbase';

// Replace with your PocketBase URL
const pb = new PocketBase('https://balancej.pockethost.io/'); // Default local PocketBase URL

// Enable auto cancellation for ongoing requests
pb.autoCancellation(false);

// Persist auth state in localStorage
if (typeof window !== 'undefined') {
  pb.authStore.onChange(() => {
    // Optional: Add any custom logic when auth state changes
    console.log('Auth state changed:', pb.authStore.isValid);
  });
}

export { pb };

// Utility functions for common operations
export const auth = {
  // Login user
  login: async (email, password) => {
    try {
      const authData = await pb.collection('users_jm').authWithPassword(email, password);
      return authData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Register new user
  register: async (userData) => {
    try {
      const user = await pb.collection('users_jm').create(userData);
      return user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Logout user
  logout: () => {
    pb.authStore.clear();
  },

  // Get current user
  getCurrentUser: () => {
    return pb.authStore.model;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return pb.authStore.isValid;
  },

  // Update user profile
  updateProfile: async (userId, data) => {
    try {
      const updatedUser = await pb.collection('users_jm').update(userId, data);
      return updatedUser;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  },

  // Change password
  changePassword: async (userId, oldPassword, newPassword) => {
    try {
      const updatedUser = await pb.collection('users_jm').update(userId, {
        oldPassword,
        password: newPassword,
        passwordConfirm: newPassword
      });
      return updatedUser;
    } catch (error) {
      console.error('Password change error:', error);
      throw error;
    }
  },

  // Request password reset
  requestPasswordReset: async (email) => {
    try {
      await pb.collection('users_jm').requestPasswordReset(email);
      return true;
    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  },

  // Confirm password reset
  confirmPasswordReset: async (token, password) => {
    try {
      await pb.collection('users_jm').confirmPasswordReset(token, password, password);
      return true;
    } catch (error) {
      console.error('Password reset confirmation error:', error);
      throw error;
    }
  },

  // Refresh authentication
  refresh: async () => {
    try {
      if (pb.authStore.isValid) {
        await pb.collection('users_jm').authRefresh();
      }
    } catch (error) {
      console.error('Auth refresh error:', error);
      pb.authStore.clear(); // Clear invalid auth
    }
  }
};

// Collection helpers
export const collections = {
  users: pb.collection('users_jm'),
  
  // Add more collections as needed
  // example: pb.collection('your_collection_name'),
};

// File upload helper
export const uploadFile = async (file, collection = 'files') => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const record = await pb.collection(collection).create(formData);
    return record;
  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
};

// Get file URL helper
export const getFileUrl = (record, filename, thumb = null) => {
  return pb.files.getUrl(record, filename, thumb);
};

export default pb;