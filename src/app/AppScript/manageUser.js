// src/AppScript/manageUsers.js
import { createUser } from '../model/User.js';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function addNewUser() {
  console.log('\n🆕 Add New User to Jyeshtha Motors Database');
  console.log('=====================================');

  try {
    const name = await askQuestion('👤 Enter full name: ');
    if (!name) {
      console.log('❌ Name is required');
      return;
    }

    const email = await askQuestion('📧 Enter email address: ');
    if (!email || !email.includes('@')) {
      console.log('❌ Valid email is required');
      return;
    }

    const password = await askQuestion('🔐 Enter password (min 6 characters): ');
    if (!password || password.length < 6) {
      console.log('❌ Password must be at least 6 characters');
      return;
    }

    console.log('\n⏳ Creating user...');
    
    const result = await createUser(email, password, name);

    if (result.success) {
      console.log('✅ User created successfully!');
      console.log(`   📧 Email: ${email}`);
      console.log(`   👤 Name: ${name}`);
      console.log(`   🏷️  Role: ${email.includes('admin') ? 'admin' : 'user'}`);
    } else {
      console.log(`❌ Failed to create user: ${result.error}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function addMultipleUsers() {
  console.log('\n👥 Add Multiple Users');
  console.log('===================');

  // Predefined users for quick setup
  const commonUsers = [
    { name: 'Manager', email: 'manager@jyeshthamotors.com', password: 'Manager@2024' },
    { name: 'Sales Person', email: 'sales@jyeshthamotors.com', password: 'Sales@2024' },
    { name: 'Mechanic', email: 'mechanic@jyeshthamotors.com', password: 'Mechanic@2024' },
    { name: 'Accountant', email: 'accounts@jyeshthamotors.com', password: 'Accounts@2024' },
  ];

  console.log('Creating common user accounts...\n');

  for (const userData of commonUsers) {
    console.log(`⏳ Creating ${userData.name}...`);
    const result = await createUser(userData.email, userData.password, userData.name);
    
    if (result.success) {
      console.log(`✅ ${userData.name} created: ${userData.email}`);
    } else {
      console.log(`❌ Failed to create ${userData.name}: ${result.error}`);
    }
  }
}

async function main() {
  console.log('🏢 Jyeshtha Motors User Management');
  console.log('=================================');
  console.log('1. Add single user (interactive)');
  console.log('2. Add common users (predefined)');
  console.log('3. Exit');

  const choice = await askQuestion('\nSelect option (1-3): ');

  switch (choice) {
    case '1':
      await addNewUser();
      break;
    case '2':
      await addMultipleUsers();
      break;
    case '3':
      console.log('👋 Goodbye!');
      process.exit(0);
      break;
    default:
      console.log('❌ Invalid choice');
      break;
  }

  // Ask if user wants to continue
  const continueChoice = await askQuestion('\nDo you want to perform another action? (y/n): ');
  if (continueChoice.toLowerCase() === 'y' || continueChoice.toLowerCase() === 'yes') {
    await main();
  } else {
    console.log('\n🎉 User management completed!');
    rl.close();
    process.exit(0);
  }
}

// Handle process exit
process.on('SIGINT', () => {
  console.log('\n👋 Goodbye!');
  rl.close();
  process.exit(0);
});

// Start the script
main().catch((error) => {
  console.error('❌ Script error:', error);
  rl.close();
  process.exit(1);
});