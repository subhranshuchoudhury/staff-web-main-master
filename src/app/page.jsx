"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import Image from "next/image";

const AuthPage = () => {
  const [currentView, setCurrentView] = useState("login"); // "login", "admin", "addUser", "changePassword"
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [adminData, setAdminData] = useState({
    newEmail: "",
    newPassword: "",
    changeEmail: "",
    currentPassword: "",
    newPasswordChange: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Initial credentials array - stored in localStorage
  const [credentials, setCredentials] = useState([
    { email: "admin@jyeshthamotors.com", password: "Jyeshtha@2024", role: "admin" },
    { email: "user@jyeshthamotors.com", password: "User@2024", role: "user" }
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleAdminChange = (e) => {
    setAdminData({
      ...adminData,
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
      localStorage.setItem("userRole", validUser.role);
      
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

    if (!adminData.newEmail || !adminData.newPassword) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    // Check if email already exists
    const existingUser = credentials.find(cred => cred.email === adminData.newEmail);
    if (existingUser) {
      setError("User with this email already exists");
      setIsLoading(false);
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newUser = {
        email: adminData.newEmail,
        password: adminData.newPassword,
        role: "user"
      };

      setCredentials([...credentials, newUser]);
      setSuccess("User added successfully!");
      setAdminData({ ...adminData, newEmail: "", newPassword: "" });
    } catch (err) {
      setError("Failed to add user. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    if (!adminData.changeEmail || !adminData.currentPassword || !adminData.newPasswordChange) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    // Find user and verify current password
    const userIndex = credentials.findIndex(cred => cred.email === adminData.changeEmail);
    if (userIndex === -1) {
      setError("User not found");
      setIsLoading(false);
      return;
    }

    if (credentials[userIndex].password !== adminData.currentPassword) {
      setError("Current password is incorrect");
      setIsLoading(false);
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedCredentials = [...credentials];
      updatedCredentials[userIndex].password = adminData.newPasswordChange;
      
      setCredentials(updatedCredentials);
      setSuccess("Password changed successfully!");
      setAdminData({ ...adminData, changeEmail: "", currentPassword: "", newPasswordChange: "" });
    } catch (err) {
      setError("Failed to change password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = (email) => {
    if (email === "admin@jyeshthamotors.com") {
      setError("Cannot delete the main admin user");
      return;
    }
    
    const updatedCredentials = credentials.filter(cred => cred.email !== email);
    setCredentials(updatedCredentials);
    setSuccess("User deleted successfully!");
  };

  const renderLoginForm = () => (
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
        <p className="text-gray-600 mt-2">Sign in to access the dashboard</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

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
            onChange={handleChange}
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
            onChange={handleChange}
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
        onClick={() => setCurrentView("admin")}
        className="w-full mt-4 bg-gray-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-700 transition duration-300"
      >
        Admin Panel
      </button>

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
  );

  const renderAdminPanel = () => (
    <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Panel</h1>
        <p className="text-gray-600 mt-2">Manage user credentials</p>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button
          onClick={() => setCurrentView("addUser")}
          className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition duration-300"
        >
          Add User
        </button>
        <button
          onClick={() => setCurrentView("changePassword")}
          className="bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition duration-300"
        >
          Change Password
        </button>
        <button
          onClick={() => setCurrentView("login")}
          className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition duration-300"
        >
          Back to Login
        </button>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Current Users</h3>
        <div className="space-y-2">
          {credentials.map((cred, index) => (
            <div key={index} className="flex justify-between items-center bg-white p-3 rounded border">
              <div>
                <span className="font-medium">{cred.email}</span>
                <span className="text-sm text-gray-500 ml-2">({cred.role})</span>
              </div>
              {cred.email !== "admin@jyeshthamotors.com" && (
                <button
                  onClick={() => handleDeleteUser(cred.email)}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAddUserForm = () => (
    <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Add New User</h1>
        <p className="text-gray-600 mt-2">Create a new user account</p>
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

      <form onSubmit={handleAddUser}>
        <div className="mb-4">
          <label htmlFor="newEmail" className="block text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            id="newEmail"
            name="newEmail"
            value={adminData.newEmail}
            onChange={handleAdminChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            name="newPassword"
            value={adminData.newPassword}
            onChange={handleAdminChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        onClick={() => setCurrentView("admin")}
        className="w-full mt-4 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition duration-300"
      >
        Back to Admin Panel
      </button>
    </div>
  );

  const renderChangePasswordForm = () => (
    <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Change Password</h1>
        <p className="text-gray-600 mt-2">Update user password</p>
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

      <form onSubmit={handleChangePassword}>
        <div className="mb-4">
          <label htmlFor="changeEmail" className="block text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            id="changeEmail"
            name="changeEmail"
            value={adminData.changeEmail}
            onChange={handleAdminChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter email address"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="currentPassword" className="block text-gray-700 mb-2">
            Current Password
          </label>
          <input
            type="password"
            id="currentPassword"
            name="currentPassword"
            value={adminData.currentPassword}
            onChange={handleAdminChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter current password"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="newPasswordChange" className="block text-gray-700 mb-2">
            New Password
          </label>
          <input
            type="password"
            id="newPasswordChange"
            name="newPasswordChange"
            value={adminData.newPasswordChange}
            onChange={handleAdminChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter new password"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 transition duration-300 disabled:opacity-50"
        >
          {isLoading ? "Changing Password..." : "Change Password"}
        </button>
      </form>

      <button
        onClick={() => setCurrentView("admin")}
        className="w-full mt-4 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition duration-300"
      >
        Back to Admin Panel
      </button>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900 p-4">
      {currentView === "login" && renderLoginForm()}
      {currentView === "admin" && renderAdminPanel()}
      {currentView === "addUser" && renderAddUserForm()}
      {currentView === "changePassword" && renderChangePasswordForm()}
    </div>
  );
};

export default AuthPage;
