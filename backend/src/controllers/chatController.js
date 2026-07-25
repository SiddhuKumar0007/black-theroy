const Chat = require('../models/Chat');

// @desc    Send customer message (creates thread if none exists)
// @route   POST /api/chat/send
// @access  Public / Customer
exports.sendCustomerMessage = async (req, res) => {
  try {
    const { name, email, text } = req.body;
    
    // Check if authenticated user
    const userId = req.user ? req.user._id : null;
    const userName = req.user ? req.user.name : (name || 'Guest Customer');
    const userEmail = req.user ? req.user.email : (email || 'guest@blacktheory.com');

    if (!text || text.trim() === '') {
      return res.status(400).json({ success: false, message: 'Message text is required' });
    }

    let chat = await Chat.findOne({ userEmail, status: 'open' });

    if (!chat) {
      chat = new Chat({
        user: userId,
        userName,
        userEmail,
        messages: [],
        status: 'open'
      });
    }

    chat.messages.push({
      senderRole: 'customer',
      senderName: userName,
      text: text.trim()
    });

    chat.lastMessage = text.trim();
    chat.unreadByAdmin = true;
    chat.unreadByCustomer = false;

    await chat.save();

    res.status(200).json({ success: true, chat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get customer chat messages
// @route   GET /api/chat/my-chat
// @access  Public / Customer
exports.getCustomerChat = async (req, res) => {
  try {
    const email = req.query.email || (req.user ? req.user.email : null);

    if (!email) {
      return res.status(200).json({ success: true, chat: null });
    }

    const chat = await Chat.findOne({ userEmail: email, status: 'open' });
    if (chat && chat.unreadByCustomer) {
      chat.unreadByCustomer = false;
      await chat.save();
    }

    res.status(200).json({ success: true, chat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all chat threads for Admin
// @route   GET /api/chat/admin/conversations
// @access  Admin
exports.getAdminChats = async (req, res) => {
  try {
    const chats = await Chat.find().sort({ updatedAt: -1 });
    res.status(200).json({ success: true, chats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin reply to customer chat
// @route   POST /api/chat/admin/reply
// @access  Admin
exports.sendAdminReply = async (req, res) => {
  try {
    const { chatId, text } = req.body;

    if (!chatId || !text || text.trim() === '') {
      return res.status(400).json({ success: false, message: 'Chat ID and reply text are required' });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat conversation not found' });
    }

    chat.messages.push({
      senderRole: 'admin',
      senderName: 'Black Theory Support',
      text: text.trim()
    });

    chat.lastMessage = `Support: ${text.trim()}`;
    chat.unreadByAdmin = false;
    chat.unreadByCustomer = true;

    await chat.save();

    res.status(200).json({ success: true, chat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Close chat conversation
// @route   PUT /api/chat/admin/close/:id
// @access  Admin
exports.closeChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }
    chat.status = 'closed';
    await chat.save();
    res.status(200).json({ success: true, message: 'Chat marked as closed', chat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
