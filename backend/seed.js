// seed.js — Run once to set up admin account + default categories
// Usage: node seed.js

require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');
const User = require('./models/User.model');
const Admin = require('./models/Admin.model');
const Vendor = require('./models/Vendor.model');
const { Category } = require('./models/index');

const findAuthByEmail = async (email) => {
  const normalized = email?.toLowerCase();
  return await User.findOne({ email: normalized })
    || await Vendor.findOne({ email: normalized })
    || await Admin.findOne({ email: normalized });
};

const categories = [
  { name: 'Electronics', slug: 'electronics', description: 'Phones, Laptops, Gadgets' },
  { name: 'Fashion', slug: 'fashion', description: 'Clothing, Footwear, Accessories' },
  { name: 'Home & Living', slug: 'home-living', description: 'Furniture, Decor, Kitchenware' },
  { name: 'Sports & Fitness', slug: 'sports-fitness', description: 'Equipment, Apparel, Nutrition' },
  { name: 'Books', slug: 'books', description: 'Fiction, Non-fiction, Educational' },
  { name: 'Beauty & Health', slug: 'beauty-health', description: 'Skincare, Makeup, Supplements' },
  { name: 'Toys & Games', slug: 'toys-games', description: 'Kids toys, Board games, Puzzles' },
  { name: 'Automotive', slug: 'automotive', description: 'Car accessories, Tools, Parts' },
];

// ── Helper: plain text prompt ──────────────────────────────────────────────────
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

// ── Helper: hidden password prompt (shows * instead of characters) ─────────────
function askHidden(question) {
  return new Promise((resolve) => {
    process.stdout.write(question);
    const stdin = process.stdin;
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');

    let input = '';
    stdin.on('data', function handler(char) {
      if (char === '\r' || char === '\n') {
        stdin.setRawMode(false);
        stdin.pause();
        stdin.removeListener('data', handler);
        process.stdout.write('\n');
        resolve(input);
      } else if (char === '\u0003') {
        // Ctrl+C → exit
        process.stdout.write('\n');
        process.exit();
      } else if (char === '\u007f') {
        // Backspace
        if (input.length > 0) {
          input = input.slice(0, -1);
          process.stdout.clearLine(0);
          process.stdout.cursorTo(0);
          process.stdout.write(question + '*'.repeat(input.length));
        }
      } else {
        input += char;
        process.stdout.write('*');
      }
    });
  });
}

// ── Main ───────────────────────────────────────────────────────────────────────
async function seed() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('   🛍️  MultiVendor eCommerce — Seeder');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // Validate env
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined. Create a backend/.env file or set MONGO_URI in your environment.');
    }

    // Connect MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected\n');

    // ── Ask admin details interactively ────────────────────────────────────
    console.log('📋 Enter Admin Account Details:\n');

    const name = await ask('   Admin Name     : ');
    const email = await ask('   Admin Email    : ');
    const password = await askHidden('   Admin Password : ');

    rl.close();

    // ── Validate inputs ────────────────────────────────────────────────────
    if (!name || !email || !password) {
      console.log('\n❌ All fields are required (name, email, password).');
      process.exit(1);
    }
    if (!email.includes('@') || !email.includes('.')) {
      console.log('\n❌ Please enter a valid email address.');
      process.exit(1);
    }
    if (password.length < 6) {
      console.log('\n❌ Password must be at least 6 characters.');
      process.exit(1);
    }

    console.log('\n⏳ Creating admin account...');

    // ── Check for existing user ────────────────────────────────────────────
    const existingUser = await findAuthByEmail(email);

    if (existingUser) {
      if (existingUser.role === 'admin') {
        console.log(`\n⚠️  An admin already exists with email: ${email}`);
        console.log('   To reset: delete the user from MongoDB and re-run this script.\n');
      } else {
        console.log(`\n❌ Email "${email}" is already registered as a ${existingUser.role} account.`);
        process.exit(1);
      }
    } else {
      // Create admin — password is auto-hashed by Admin model pre-save hook
      await Admin.create({
        name,
        email: email.toLowerCase(),
        password,
        role: 'admin',
        isActive: true,
        isBanned: false,
      });
      console.log('✅ Admin account created!\n');
    }

    // ── Seed Categories ────────────────────────────────────────────────────
    console.log('⏳ Seeding default categories...');
    let newCount = 0;
    for (const cat of categories) {
      const exists = await Category.findOne({ slug: cat.slug });
      if (!exists) {
        await Category.create(cat);
        newCount++;
      }
    }
    console.log(`✅ Categories done — ${newCount} new, ${categories.length - newCount} already existed\n`);

    // ── Done ───────────────────────────────────────────────────────────────
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 Seeding Complete!\n');
    console.log('   Admin Login:');
    console.log(`   Email    : ${email.toLowerCase()}`);
    console.log(`   Password : (the password you just entered)`);
    console.log(`   URL      : http://localhost:5173/admin/login`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (err) {
    console.error('\n❌ Seed failed:', err.message);
    rl.close();
    process.exit(1);
  }
}

seed();
