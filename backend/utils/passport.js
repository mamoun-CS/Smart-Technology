const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const userModel = require('../models/userModel');
require('dotenv').config();

// Passport Google Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback'
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists
      let user = await userModel.findByGoogleId(profile.id);
      
      if (!user) {
        // Check by email
        user = await userModel.findByEmail(profile.emails[0].value);
        
        if (user) {
          // Link Google account to existing user
          const query = `
            UPDATE users SET google_id = $1, avatar = $2
            WHERE id = $3 RETURNING *
          `;
          const result = await pool.query(query, [profile.id, profile.photos[0].value, user.id]);
          user = result.rows[0];
        } else {
          // Create new user
          user = await userModel.createGoogleUser({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            avatar: profile.photos[0].value
          });
        }
      }
      
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));
}

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await userModel.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;