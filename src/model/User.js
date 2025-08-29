// src/model/User.js
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { connectToDatabase } from './database.js';

export async function createUser(email, password, name = null) {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('users');

    // Check if user already exists
    const existingUser = await collection.findOne({ email });
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user document
    const user = {
      email,
      password: hashedPassword,
      name: name || email.split('@')[0],
      createdAt: new Date(),
      lastLogin: null,
      role: email === 'admin@jyeshthamotors.com' ? 'admin' : 'user',
      resetPasswordToken: null,
      resetPasswordExpires: null
    };

    // Insert user
    const result = await collection.insertOne(user);
    
    return {
      success: true,
      userId: result.insertedId,
      user: { email, name: user.name, role: user.role }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

export async function validateUser(email, password) {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('users');

    // Find user by email
    const user = await collection.findOne({ email });
    if (!user) {
      return { success: false, error: 'Invalid email or password' };
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return { success: false, error: 'Invalid email or password' };
    }

    // Update last login
    await collection.updateOne(
      { email },
      { $set: { lastLogin: new Date() } }
    );

    return {
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        lastLogin: user.lastLogin
      }
    };
  } catch (error) {
    return {
      success: false,
      error: 'Authentication failed'
    };
  }
}

export async function getUserByEmail(email) {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('users');
    
    const user = await collection.findOne({ email }, { projection: { password: 0 } });
    return user;
  } catch (error) {
    return null;
  }
}

export async function getAllUsers() {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('users');
    
    const users = await collection.find({}, { projection: { password: 0 } }).toArray();
    return users;
  } catch (error) {
    return [];
  }
}

// NEW FUNCTION FOR DIRECT PASSWORD CHANGE
export async function changePassword(email, currentPassword, newPassword) {
  try {
    // Validate input
    if (!email || !currentPassword || !newPassword) {
      throw new Error('Email, current password, and new password are required');
    }

    // Validate password length
    if (newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters long');
    }

    // Validate current password
    const validation = await validateUser(email, currentPassword);
    if (!validation.success) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password in database
    const { db } = await connectToDatabase();
    const collection = db.collection('users');
    
    const result = await collection.updateOne(
      { email },
      { 
        $set: { 
          password: hashedPassword,
          lastLogin: new Date()
        }
      }
    );

    if (result.modifiedCount === 0) {
      throw new Error('Failed to update password');
    }

    return {
      success: true,
      message: 'Password changed successfully'
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// NEW FUNCTIONS FOR PASSWORD RESET (TOKEN-BASED)

export async function generateResetToken(email) {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('users');

    // Check if user exists
    const user = await collection.findOne({ email });
    if (!user) {
      return {
        success: false,
        error: 'User not found'
      };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Update user with reset token
    await collection.updateOne(
      { email },
      {
        $set: {
          resetPasswordToken: resetToken,
          resetPasswordExpires: resetTokenExpiry
        }
      }
    );

    return {
      success: true,
      resetToken,
      user: {
        email: user.email,
        name: user.name
      }
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to generate reset token'
    };
  }
}

export async function validateResetToken(token) {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('users');

    // Find user with valid reset token
    const user = await collection.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return {
        success: false,
        error: 'Invalid or expired reset token'
      };
    }

    return {
      success: true,
      user: {
        email: user.email,
        name: user.name
      }
    };
  } catch (error) {
    return {
      success: false,
      error: 'Token validation failed'
    };
  }
}

export async function resetPassword(token, newPassword) {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('users');

    // Find user with valid reset token
    const user = await collection.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return {
        success: false,
        error: 'Invalid or expired reset token'
      };
    }

    // Validate password length
    if (newPassword.length < 6) {
      return {
        success: false,
        error: 'Password must be at least 6 characters long'
      };
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password and clear reset token
    await collection.updateOne(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword,
          lastLogin: new Date()
        },
        $unset: {
          resetPasswordToken: "",
          resetPasswordExpires: ""
        }
      }
    );

    return {
      success: true,
      message: 'Password reset successful',
      user: {
        email: user.email,
        name: user.name,
        role: user.role
      }
    };
  } catch (error) {
    return {
      success: false,
      error: 'Password reset failed'
    };
  }
}

export async function clearExpiredResetTokens() {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('users');

    // Clear expired reset tokens
    await collection.updateMany(
      { resetPasswordExpires: { $lt: new Date() } },
      {
        $unset: {
          resetPasswordToken: "",
          resetPasswordExpires: ""
        }
      }
    );

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to clear expired tokens' };
  }
}
