"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { pb } from "./lib/pocketbase"; // Import PocketBase client

const AuthPage = () => {
  const [authMode, setAuthMode] = useState("login"); // login, register, change-password
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const router = useRouter();

  // Check if user is already authenticated
  useEffect(() => {
    if (pb.authStore.isValid) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear messages when user starts typing
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      switch (authMode) {
        case "login":
          await handleLogin();
          break;
        case "register":
          await handleRegister();
          break;
        case "change-password":
          await handleChangePassword();
          break;
      }
    } catch (err) {
      console.error('Auth error:', err);
      // Extract error message from PocketBase response
      const errorMessage = err?.data?.message || err.message || "An error occurred. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      // Authenticate with PocketBase
      await pb.collection('users_jm').authWithPassword(
        formData.email,
        formData.password
      );

      setSuccess("Login successful!");
      
      // Redirect to dashboard
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
      
    } catch (error) {
      if (error.status === 400) {
        setError("Invalid email or password");
      } else {
        setError("Login failed. Please try again.");
      }
      throw error;
    }
  };

  const handleRegister = async () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    try {
      // Create new user in PocketBase - FIXED HERE
      const userData = {
        email: formData.email,
        password: formData.password,
        passwordConfirm: formData.confirmPassword,
        name: formData.name,
        emailVisibility: true, // This is required by PocketBase for new user registration
      };

      await pb.collection('users_jm').create(userData);

      setSuccess("Registration successful! You can now login.");
      setTimeout(() => {
        setAuthMode("login");
        clearForm();
      }, 2000);

    } catch (error) {
      // Enhanced error handling to show validation errors from PocketBase
      if (error.data) {
        const errorData = error.data;
        if (errorData.email) {
          setError(errorData.email.message || "Email is already registered or invalid");
        } else if (errorData.password) {
          setError(errorData.password.message || "Password requirements not met");
        } else if (errorData.name) {
          setError(errorData.name.message || "Invalid name provided");
        } else {
          setError("Registration failed. Please check your information.");
        }
      } else {
        setError("Registration failed. Please try again.");
      }
      throw error;
    }
  };

  const handleChangePassword = async () => {
    if (!formData.email || !formData.currentPassword || !formData.newPassword || !formData.confirmNewPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("New password must be at least 6 characters long");
      return;
    }

    if (formData.newPassword !== formData.confirmNewPassword) {
      setError("New passwords do not match");
      return;
    }

    try {
      // First, authenticate with current credentials
      await pb.collection('users_jm').authWithPassword(
        formData.email,
        formData.currentPassword
      );

      // Then update the password
      await pb.collection('users_jm').update(pb.authStore.model.id, {
        password: formData.newPassword,
        passwordConfirm: formData.confirmNewPassword,
        oldPassword: formData.currentPassword
      });

      // Clear auth store to force re-login
      pb.authStore.clear();

      setSuccess("Password changed successfully! Please login with your new password.");
      setTimeout(() => {
        setAuthMode("login");
        clearForm();
      }, 2000);

    } catch (error) {
      if (error.status === 400) {
        const errorData = error.data;
        if (errorData.oldPassword) {
          setError("Current password is incorrect");
        } else if (errorData.password) {
          setError("New password requirements not met");
        } else {
          setError("Invalid current password or email");
        }
      } else {
        setError("Password change failed. Please try again.");
      }
      throw error;
    }
  };

  const clearForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
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

  const renderTitle = () => {
    switch (authMode) {
      case "login":
        return "Sign in to access the dashboard";
      case "register":
        return "Create your account";
      case "change-password":
        return "Change your password";
      default:
        return "Welcome";
    }
  };

  const renderSubmitButton = () => {
    const buttonText = {
      "login": isLoading ? "Signing in..." : "Sign In",
      "register": isLoading ? "Creating account..." : "Create Account",
      "change-password": isLoading ? "Changing password..." : "Change Password"
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

  return (
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
                required
              />
            </div>
          )}

          {/* Email field for login, register, and change password */}
          {(authMode === "login" || authMode === "register" || authMode === "change-password") && (
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
                required
              />
            </div>
          )}

          {/* Password field for login and register */}
          {(authMode === "login" || authMode === "register") && (
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
                required
                minLength={6}
              />
            </div>
          )}

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
                required
                minLength={6}
              />
            </div>
          )}

          {/* Current Password field for change password */}
          {authMode === "change-password" && (
            <div className="mb-4">
              <label htmlFor="currentPassword" className="block text-gray-700 mb-2">
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your current password"
                autoComplete="current-password"
                required
              />
            </div>
          )}

          {/* New Password fields for change password */}
          {authMode === "change-password" && (
            <>
              <div className="mb-4">
                <label htmlFor="newPassword" className="block text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your new password (min 6 characters)"
                  autoComplete="new-password"
                  required
                  minLength={6}
                />
              </div>
              <div className="mb-6">
                <label htmlFor="confirmNewPassword" className="block text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmNewPassword"
                  name="confirmNewPassword"
                  value={formData.confirmNewPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirm your new password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                />
              </div>
            </>
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
                  onClick={() => switchMode("change-password")}
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                >
                  Change your password?
                </button>
              </div>
              <div>
               
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

          {authMode === "change-password" && (
            <button
              type="button"
              onClick={() => switchMode("login")}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Back to login
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
  );
};

export default AuthPage;
