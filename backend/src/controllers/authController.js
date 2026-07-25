const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Address = require('../models/Address');

// Helper to generate JWT
const getSignedToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secretkey123_blacktheory', {
    expiresIn: '30d'
  });
};

// Helper to send response with token
const sendTokenResponse = (user, statusCode, res) => {
  const token = getSignedToken(user._id);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    user
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: email.includes('@blacktheory.com') ? 'admin' : 'customer' // Automatically make @blacktheory.com emails admin
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.isBanned) {
      return res.status(403).json({ success: false, message: 'Your account has been suspended' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Google Sign-In with real ID token verification
// @route   POST /api/auth/google
// @access  Public
exports.googleLogin = async (req, res, next) => {
  try {
    let { credential, email, name, googleId } = req.body;
    const clientId = process.env.GOOGLE_CLIENT_ID;

    if (typeof email === 'object' && email !== null) {
      email = email.email || email.address || '';
    }
    if (typeof email === 'string') {
      email = email.toLowerCase().trim();
    }

    // ── Real Google token verification (when Client ID is configured) ──
    if (credential && clientId && clientId !== 'YOUR_GOOGLE_CLIENT_ID_HERE') {
      const { OAuth2Client } = require('google-auth-library');
      const client = new OAuth2Client(clientId);

      let payload;
      try {
        const ticket = await client.verifyIdToken({
          idToken: credential,
          audience: clientId,
        });
        payload = ticket.getPayload();
      } catch (verifyErr) {
        console.error('Google token verify failed:', verifyErr.message);
        return res.status(401).json({ success: false, message: 'Invalid Google token. Please try again.' });
      }

      const gEmail = payload.email;
      const gName = payload.name || payload.given_name || 'Google User';
      const gPicture = payload.picture || '';

      if (!payload.email_verified) {
        return res.status(401).json({ success: false, message: 'Google account email not verified.' });
      }

      const isEmailAdmin = (emailStr) => {
        if (!emailStr) return false;
        const lower = emailStr.toLowerCase().trim();
        return lower === 'siddhujha2006@gmail.com' || lower === 'admin@blacktheory.com' || lower.endsWith('@blacktheory.com');
      };

      let user = await User.findOne({ email: gEmail });
      if (!user) {
        user = await User.create({
          name: gName,
          email: gEmail,
          avatar: gPicture,
          password: Math.random().toString(36).slice(-16) + Date.now(),
          role: isEmailAdmin(gEmail) ? 'admin' : 'customer',
          googleId: payload.sub,
        });
      } else {
        // Ensure admin role if email matches admin list
        if (isEmailAdmin(gEmail) && user.role !== 'admin') {
          user.role = 'admin';
        }
        if (!user.googleId) { user.googleId = payload.sub; }
        await user.save();
      }

      if (user.isBanned) {
        return res.status(403).json({ success: false, message: 'Your account has been suspended.' });
      }

      return sendTokenResponse(user, 200, res);
    }

    // ── Fallback: email-based mock (for dev without Client ID) ──
    if (!email) {
      return res.status(400).json({ success: false, message: 'Google credential or email required' });
    }

    const isEmailAdmin = (emailStr) => {
      if (!emailStr) return false;
      const lower = emailStr.toLowerCase().trim();
      return lower === 'siddhujha2006@gmail.com' || lower === 'admin@blacktheory.com' || lower.endsWith('@blacktheory.com');
    };

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: name || 'Google User',
        email,
        password: Math.random().toString(36).slice(-10),
        role: isEmailAdmin(email) ? 'admin' : 'customer'
      });
    } else {
      if (isEmailAdmin(email) && user.role !== 'admin') {
        user.role = 'admin';
        await user.save();
      }
    }

    if (user.isBanned) {
      return res.status(403).json({ success: false, message: 'Your account has been suspended' });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};


// ── OTP Store (in-memory, auto-expires after 10 mins) ──────────────────────
const otpStore = new Map(); // key: phone/email, value: { otp, expiresAt }

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const storeOTP = (key, otp) => {
  otpStore.set(key, { otp, expiresAt: Date.now() + 10 * 60 * 1000 }); // 10 minutes
};

const verifyStoredOTP = (key, inputOtp) => {
  const record = otpStore.get(key);
  if (!record) return { valid: false, message: 'OTP not found. Please request a new one.' };
  if (Date.now() > record.expiresAt) {
    otpStore.delete(key);
    return { valid: false, message: 'OTP has expired. Please request a new one.' };
  }
  if (record.otp !== inputOtp) return { valid: false, message: 'Invalid OTP code. Please check and try again.' };
  otpStore.delete(key); // OTP is one-time use
  return { valid: true };
};

// ── Send Phone OTP via Fast2SMS (Quick SMS Route) ──────────────────────────
const sendPhoneOTP = async (phone, otp) => {
  const apiKey = process.env.FAST2SMS_API_KEY;
  if (!apiKey || apiKey === 'YOUR_FAST2SMS_API_KEY_HERE') {
    console.log(`[SANDBOX] SMS OTP to ${phone}: ${otp}`);
    return { success: true, sandbox: true };
  }

  try {
    const axios = require('axios');
    const message = `Your Black Theory login OTP is: ${otp}. Valid for 10 minutes. Do not share with anyone.`;
    const response = await axios.get('https://www.fast2sms.com/dev/bulkV2', {
      params: {
        authorization: apiKey,
        message: message,
        language: 'english',
        route: 'q',
        numbers: phone
      },
      timeout: 8000
    });
    if (response.data?.return === true) {
      return { success: true };
    }
    console.error('Fast2SMS Error:', response.data);
    const errMsg = Array.isArray(response.data?.message)
      ? response.data.message[0]
      : (response.data?.message || 'SMS sending failed');
    return { success: false, message: errMsg };
  } catch (err) {
    console.error('Fast2SMS Exception:', err.message);
    return { success: false, message: 'SMS service unavailable. Please try again.' };
  }
};

// ── Send Email OTP via Nodemailer/Gmail ─────────────────────────────────────
const sendEmailOTP = async (email, otp) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_APP_PASSWORD;

  if (!emailUser || emailUser === 'your_gmail@gmail.com' || !emailPass || emailPass === 'your_gmail_app_password') {
    // Sandbox fallback
    console.log(`[SANDBOX] Email OTP to ${email}: ${otp}`);
    return { success: true, sandbox: true };
  }

  try {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: emailUser, pass: emailPass }
    });

    await transporter.sendMail({
      from: `"Black Theory" <${emailUser}>`,
      to: email,
      subject: 'Black Theory - Password Reset OTP',
      html: `
        <div style="background:#0B0B0B;padding:40px;font-family:sans-serif;color:white;max-width:480px;margin:0 auto;border-radius:8px">
          <h2 style="letter-spacing:0.2em;text-transform:uppercase;margin-bottom:8px">Black Theory</h2>
          <p style="color:#888;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:32px">Password Reset Verification</p>
          <p style="color:#ccc;margin-bottom:16px">Your OTP verification code is:</p>
          <div style="background:#1a1a1a;border:1px solid #333;padding:24px;text-align:center;border-radius:6px;margin:20px 0">
            <span style="font-size:36px;font-weight:900;letter-spacing:0.4em;color:white">${otp}</span>
          </div>
          <p style="color:#666;font-size:12px;margin-top:24px">This code expires in 10 minutes. Do not share it with anyone.</p>
        </div>
      `
    });
    return { success: true };
  } catch (err) {
    console.error('Email OTP error:', err.message);
    return { success: false, message: 'Email sending failed. Please check email configuration.' };
  }
};

// @desc    Request Phone OTP for login
// @route   POST /api/auth/otp-request
// @access  Public
exports.requestOtp = async (req, res, next) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number required' });
    }

    const otp = generateOTP();
    storeOTP(phone, otp);
    const result = await sendPhoneOTP(phone, otp);

    if (!result.success) {
      return res.status(500).json({ success: false, message: result.message });
    }

    res.status(200).json({
      success: true,
      sandbox: result.sandbox || false,
      message: result.sandbox
        ? `[Sandbox] OTP for ${phone} is: ${otp} (Setup Fast2SMS for real SMS)`
        : `OTP sent to ${phone} successfully`
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify Phone OTP and login
// @route   POST /api/auth/otp-verify
// @access  Public
exports.verifyOtp = async (req, res, next) => {
  try {
    const { phone, code } = req.body;
    if (!phone || !code) {
      return res.status(400).json({ success: false, message: 'Phone number and OTP code required' });
    }

    const check = verifyStoredOTP(phone, code);
    if (!check.valid) {
      return res.status(400).json({ success: false, message: check.message });
    }

    // Find or create user by phone
    let user = await User.findOne({ phone });
    if (!user) {
      const randomId = Math.random().toString(36).slice(-5);
      user = await User.create({
        name: `User_${randomId}`,
        email: `phone_${randomId}@blacktheory.com`,
        phone,
        password: Math.random().toString(36).slice(-10)
      });
    }

    if (user.isBanned) {
      return res.status(403).json({ success: false, message: 'Your account has been suspended' });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};


// @desc    Update user profile details
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      phone: req.body.phone
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Request OTP for Forgot Password (sent to Email)
// @route   POST /api/auth/forgot-password-otp
// @access  Public
exports.forgotPasswordOtp = async (req, res, next) => {
  try {
    const { identifier } = req.body; // email address
    if (!identifier) {
      return res.status(400).json({ success: false, message: 'Please provide your email address' });
    }

    const otp = generateOTP();
    storeOTP(identifier.toLowerCase().trim(), otp);
    const result = await sendEmailOTP(identifier.trim(), otp);

    if (!result.success) {
      return res.status(500).json({ success: false, message: result.message });
    }

    res.status(200).json({
      success: true,
      sandbox: result.sandbox || false,
      message: result.sandbox
        ? `[Sandbox] Email OTP for ${identifier} is: ${otp} (Setup Gmail to receive real emails)`
        : `OTP sent to ${identifier} successfully. Check your inbox.`
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Reset Password with Email OTP
// @route   POST /api/auth/reset-password-otp
// @access  Public
exports.resetPasswordOtp = async (req, res, next) => {
  try {
    const { identifier, code, newPassword } = req.body;

    if (!identifier || !code || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, OTP code, and new password are required' });
    }

    const cleanIdentifier = identifier.toLowerCase().trim();

    // Verify OTP from store
    const check = verifyStoredOTP(cleanIdentifier, code);
    if (!check.valid) {
      return res.status(400).json({ success: false, message: check.message });
    }

    let user = await User.findOne({ email: cleanIdentifier });

    if (!user) {
      // Create user if not found (after DB reset scenario)
      const userName = cleanIdentifier.split('@')[0];
      user = await User.create({
        name: userName,
        email: cleanIdentifier,
        password: newPassword,
        role: cleanIdentifier.includes('@blacktheory.com') ? 'admin' : 'customer'
      });
    } else {
      user.password = newPassword;
      await user.save();
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

