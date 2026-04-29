const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn(
      '[db] MONGODB_URI is not set. Add it to backend/.env — sign up and login will not work until MongoDB is connected.'
    );
    return;
  }
  try {
    const redactedUri = uri.replace(/:([^@]+)@/, ':****@');
    console.log(`[db] Attempting to connect to MongoDB...`);
    // console.log(`[db] Using URI: ${redactedUri}`);

    await mongoose.connect(uri);
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('[db] MongoDB connection failed!');
    console.error('[db] Error Name:', err.name);
    console.error('[db] Error Message:', err.message);
    if (err.reason) {
      console.error('[db] Error Reason:', JSON.stringify(err.reason, null, 2));
    }
    console.log('[db] Tip: Check if your IP is allowlisted in Atlas and if your password is correct in .env (remove < > brackets).');
  }
}

module.exports = connectDB;
