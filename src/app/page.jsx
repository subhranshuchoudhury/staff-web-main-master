"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import Image from "next/image";

const AuthPage = () => {
  const [showAddUser, setShowAddUser] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [newUserData, setNewUserData] = useState({
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Credentials array - gets updated when new users are added
  const [credentials, setCredentials] = useState([
    { email: "admin@jyeshthamotors.com", password: "Jyeshtha@2024" },
    { email: "user@jyeshthamotors.com", password: "User@2024" }
  ]);

  const router = useRouter();

  // Load credentials from localStorage on component mount
  useEffect(() => {
    const storedCredentials = localStorage.getItem("jyeshtha_credentials");
    if (storedCredentials) {
      setCredentials(JSON.parse(storedCredentials));
    }
  }, []);

  // Save credentials to localStorage whenever credentials change
  useEffect(() => {
    localStorage.setItem("jyeshtha_credentials", JSON.stringify(credentials));
  }, [credentials]);

  const handleLoginChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleNewUserChange = (e) => {
    setNewUserData({
      ...newUserData,
      [e.target.name]: e.target.value
    });
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    // Check credentials against our array
    const validUser = credentials.find(
      cred => cred.email === formData.email && cred.password === formData.password
    );

    if (!validUser) {
      setError("Invalid email or password");
      setIsLoading(false);
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("email", formData.email);
      
      document.cookie = "authToken=authenticated; path=/; max-age=86400";
      
      router.push("/dashboard");
    } catch (err) {
      setError("Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    if (!newUserData.email || !newUserData.password) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    // Check if email already exists
    const existingUser = credentials.find(cred => cred.email === newUserData.email);
    if (existingUser) {
      setError("User with this email already exists");
      setIsLoading(false);
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Add new user to credentials array
      const newUser = {
        email: newUserData.email,
        password: newUserData.password
      };

      setCredentials([...credentials, newUser]);
      setSuccess("New user added successfully! They can now login.");
      setNewUserData({ email: "", password: "" });
    } catch (err) {
      setError("Failed to add user. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
          <p className="text-gray-600 mt-2">
            {showAddUser ? "Add New User" : "Sign in to access the dashboard"}
          </p>
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

        {!showAddUser ? (
          // Login Form
          <>
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleLoginChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email"
                  autoComplete="email"
                />
              </div>

              <div className="mb-6">
                <label htmlFor="password" className="block text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleLoginChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <span className="loading loading-spinner loading-sm mr-2"></span>
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <button
              onClick={() => setShowAddUser(true)}
              className="w-full mt-4 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition duration-300"
            >
              New User
            </button>
          </>
        ) : (
          // Add User Form
          <>
            <form onSubmit={handleAddUser}>
              <div className="mb-4">
                <label htmlFor="newEmail" className="block text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="newEmail"
                  name="email"
                  value={newUserData.email}
                  onChange={handleNewUserChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter email address"
                />
              </div>

              <div className="mb-6">
                <label htmlFor="newPassword" className="block text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="password"
                  value={newUserData.password}
                  onChange={handleNewUserChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter password"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition duration-300 disabled:opacity-50"
              >
                {isLoading ? "Adding User..." : "Add User"}
              </button>
            </form>

            <button
              onClick={() => setShowAddUser(false)}
              className="w-full mt-4 bg-gray-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-700 transition duration-300"
            >
              Back to Login
            </button>
          </>
        )}

        {/* Current Users Display */}
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-600 font-semibold mb-2">Current Users ({credentials.length}):</p>
          <div className="space-y-1">
            {credentials.map((cred, index) => (
              <p key={index} className="text-xs text-gray-600 font-mono">
                {cred.email}
              </p>
            ))}
          </div>
        </div>

        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
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
