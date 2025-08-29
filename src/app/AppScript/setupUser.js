// src/AppScript/setupUsers.js
import { createUser } from '../model/User.js';

async function setupUsers() {
  console.log('🚀 Setting up users for Jyeshtha Motors...');

  try {
    // Create admin user with your existing credentials
    const adminResult = await createUser(
      'admin@jyeshthamotors.com',
      'Jyeshtha@2024',
      'Administrator'
    );

    if (adminResult.success) {
      console.log('✅ Admin user created successfully');
      console.log(`   📧 Email: admin@jyeshthamotors.com`);
      console.log(`   👑 Role: Admin`);
    } else {
      console.log('⚠️ Admin user setup:', adminResult.error);
    }

    // You can add more users here if needed
    // Example for staff members:
    /*
    const staffResult = await createUser(
      'staff@jyeshthamotors.com',
      'Staff@2024',
      'Staff Member'
    );
    
    if (staffResult.success) {
      console.log('✅ Staff user created successfully');
    }
    */

    console.log('\n🎉 User setup completed successfully!');
    console.log('💡 You can now login with your existing credentials.');
    console.log('🔐 All passwords are securely hashed in MongoDB.');

  } catch (error) {
    console.error('❌ Error setting up users:', error);
    process.exit(1);
  }

  process.exit(0);
}

// Additional utility functions you might want to use
export async function createMultipleUsers(userList) {
  console.log(`📝 Creating ${userList.length} users...`);
  
  for (const userData of userList) {
    const result = await createUser(userData.email, userData.password, userData.name);
    if (result.success) {
      console.log(`✅ Created: ${userData.email}`);
    } else {
      console.log(`❌ Failed to create ${userData.email}: ${result.error}`);
    }
  }
}

// Run the setup
setupUsers().catch(console.error);
