"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import Image from "next/image";

const AuthPage = () => {
  const [authMode, setAuthMode] = useState("login"); // login, register
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  
  // Separate state for forgot password modal
  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: ""
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPasswordLoading, setIsForgotPasswordLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [forgotPasswordError, setForgotPasswordError] = useState("");
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState("");

  const router = useRouter();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear messages when user starts typing
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleForgotPasswordChange = (e) => {
    setForgotPasswordData({
      ...forgotPasswordData,
      [e.target.name]: e.target.value
    });
    // Clear messages when user starts typing
    if (forgotPasswordError) setForgotPasswordError("");
    if (forgotPasswordSuccess) setForgotPasswordSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      let endpoint, body;

      switch (authMode) {
        case "login":
          if (!formData.email || !formData.password) {
            setError("Please fill in all fields");
            setIsLoading(false);
            return;
          }
          endpoint = '/api/auth/login';
          body = { email: formData.email, password: formData.password };
          break;

        case "register":
          if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
            setError("Please fill in all fields");
            setIsLoading(false);
            return;
          }
          if (formData.password.length < 6) {
            setError("Password must be at least 6 characters long");
            setIsLoading(false);
            return;
          }
          if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            setIsLoading(false);
            return;
          }
          endpoint = '/api/auth/register';
          body = { name: formData.name, email: formData.email, password: formData.password };
          break;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        switch (authMode) {
          case "login":
            // Note: You should avoid using localStorage in production for sensitive data
            // Consider using httpOnly cookies instead
            localStorage.setItem("isAuthenticated", "true");
            localStorage.setItem("email", formData.email);
            localStorage.setItem("user", JSON.stringify(data.user));
            router.push("/dashboard");
            break;

          case "register":
            setSuccess("Registration successful! You can now login.");
            setAuthMode("login");
            clearForm();
            break;
        }
      } else {
        setError(data.error || "Operation failed");
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setIsForgotPasswordLoading(true);
    setForgotPasswordError("");
    setForgotPasswordSuccess("");

    // Validate all required fields
    if (!forgotPasswordData.email || !forgotPasswordData.currentPassword || 
        !forgotPasswordData.newPassword || !forgotPasswordData.confirmNewPassword) {
      setForgotPasswordError("Please fill in all fields");
      setIsForgotPasswordLoading(false);
      return;
    }
    
    // Validate password requirements
    if (forgotPasswordData.newPassword.length < 6) {
      setForgotPasswordError("New password must be at least 6 characters long");
      setIsForgotPasswordLoading(false);
      return;
    }
    
    if (forgotPasswordData.newPassword !== forgotPasswordData.confirmNewPassword) {
      setForgotPasswordError("New passwords do not match");
      setIsForgotPasswordLoading(false);
      return;
    }

    if (forgotPasswordData.currentPassword === forgotPasswordData.newPassword) {
      setForgotPasswordError("New password must be different from current password");
      setIsForgotPasswordLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: forgotPasswordData.email,
          currentPassword: forgotPasswordData.currentPassword,
          newPassword: forgotPasswordData.newPassword
        }),
      });

      const data = await response.json();

      if (data.success) {
        setForgotPasswordSuccess("Password changed successfully! You can now login with your new password.");
        setTimeout(() => {
          setShowForgotPasswordModal(false);
          clearForgotPasswordForm();
          setAuthMode("login");
        }, 2000);
      } else {
        setForgotPasswordError(data.error || "Failed to change password");
      }
    } catch (err) {
      console.error('Change password error:', err);
      setForgotPasswordError("Network error. Please check your connection and try again.");
    } finally {
      setIsForgotPasswordLoading(false);
    }
  };

  const clearForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  };

  const clearForgotPasswordForm = () => {
    setForgotPasswordData({
      email: "",
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: ""
    });
  };

  const switchMode = (mode) => {
    setAuthMode(mode);
    clearForm();
    setError("");
    setSuccess("");
  };

  const openForgotPasswordModal = () => {
    setShowForgotPasswordModal(true);
    setForgotPasswordError("");
    setForgotPasswordSuccess("");
    clearForgotPasswordForm();
  };

  const closeForgotPasswordModal = () => {
    setShowForgotPasswordModal(false);
    setForgotPasswordError("");
    setForgotPasswordSuccess("");
    clearForgotPasswordForm();
  };

  const renderTitle = () => {
    switch (authMode) {
      case "login":
        return "Sign in to access the dashboard";
      case "register":
        return "Create your account";
      default:
        return "Welcome";
    }
  };

  const renderSubmitButton = () => {
    const buttonText = {
      "login": isLoading ? "Signing in..." : "Sign In",
      "register": isLoading ? "Creating account..." : "Create Account",
    };

    return (
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <span className="loading loading-spinner loading-sm mr-2"></span>
            {buttonText[authMode]}
          </div>
        ) : (
          buttonText[authMode]
        )}
      </button>
    );
  };

  // Forgot Password Modal Component
  const ForgotPasswordModal = () => {
    if (!showForgotPasswordModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Change Password</h2>
            <button
              onClick={closeForgotPasswordModal}
              className="text-gray-500 hover:text-gray-700 text-2xl"
              disabled={isForgotPasswordLoading}
            >
              ×
            </button>
          </div>

          {forgotPasswordError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {forgotPasswordError}
            </div>
          )}

          {forgotPasswordSuccess && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {forgotPasswordSuccess}
            </div>
          )}

          <form onSubmit={handleForgotPasswordSubmit}>
            <div className="mb-4">
              <label htmlFor="forgotEmail" className="block text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="forgotEmail"
                name="email"
                value={forgotPasswordData.email}
                onChange={handleForgotPasswordChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
                autoComplete="email"
                disabled={isForgotPasswordLoading}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="forgotCurrentPassword" className="block text-gray-700 mb-2">
                Current Password
              </label>
              <input
                type="password"
                id="forgotCurrentPassword"
                name="currentPassword"
                value={forgotPasswordData.currentPassword}
                onChange={handleForgotPasswordChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your current password"
                autoComplete="current-password"
                disabled={isForgotPasswordLoading}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="forgotNewPassword" className="block text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                id="forgotNewPassword"
                name="newPassword"
                value={forgotPasswordData.newPassword}
                onChange={handleForgotPasswordChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your new password (min 6 characters)"
                autoComplete="new-password"
                disabled={isForgotPasswordLoading}
              />
            </div>

            <div className="mb-6">
              <label htmlFor="forgotConfirmNewPassword" className="block text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                id="forgotConfirmNewPassword"
                name="confirmNewPassword"
                value={forgotPasswordData.confirmNewPassword}
                onChange={handleForgotPasswordChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Confirm your new password"
                autoComplete="new-password"
                disabled={isForgotPasswordLoading}
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={closeForgotPasswordModal}
                disabled={isForgotPasswordLoading}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-400 transition duration-300 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isForgotPasswordLoading}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isForgotPasswordLoading ? (
                  <div className="flex items-center justify-center">
                    <span className="loading loading-spinner loading-sm mr-2"></span>
                    Changing...
                  </div>
                ) : (
                  "Change Password"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Image
                src="/assets/images/jmlogo.jpg"
                alt="Jyeshtha Motors"
                width={80}
                height={80}
                className="rounded-full"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Jyeshtha Motors</h1>
            <p className="text-gray-600 mt-2">{renderTitle()}</p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Name field for registration */}
            {authMode === "register" && (
              <div className="mb-4">
                <label htmlFor="name" className="block text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your full name"
                  autoComplete="name"
                />
              </div>
            )}

            {/* Email field for login and register */}
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
                autoComplete="email"
              />
            </div>

            {/* Password field for login and register */}
            <div className="mb-4">
              <label htmlFor="password" className="block text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={authMode === "login" ? "Enter your password" : "Create a password (min 6 characters)"}
                autoComplete={authMode === "login" ? "current-password" : "new-password"}
              />
            </div>

            {/* Confirm Password field for registration */}
            {authMode === "register" && (
              <div className="mb-6">
                <label htmlFor="confirmPassword" className="block text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                />
              </div>
            )}

            {renderSubmitButton()}
          </form>

          {/* Navigation Links */}
          <div className="mt-6 text-center space-y-2">
            {authMode === "login" && (
              <>
                <div>
                  <button
                    type="button"
                    onClick={openForgotPasswordModal}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                  >
                    Change your password?
                  </button>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => switchMode("register")}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Don't have an account? Create one
                  </button>
                </div>
              </>
            )}

            {authMode === "register" && (
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Already have an account? Sign in
              </button>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600 text-center font-semibold">
              Terms and Conditions
            </p>
            <p className="text-sm text-gray-600 text-center mt-1">
              <span className="font-mono">Cuttack, Bhubaneswar</span>
            </p>
            <p className="text-sm text-gray-600 text-center">
              <span className="font-mono">2025 Pvt LTD</span>
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal />
    </>
  );
};

export default AuthPage;
