"use client";

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, User, Mail, Headset, Circle } from 'lucide-react';
import { useAuth, API_URL } from '../context/AuthContext';

export default function CustomerChatWidget() {
  const { isAuthenticated, user, token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [guestInfoSaved, setGuestInfoSaved] = useState(false);
  const messagesEndRef = useRef(null);

  // Sync user info if logged in
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setGuestInfoSaved(true);
    }
  }, [user]);

  // Scroll to bottom when messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (chat?.messages) {
      scrollToBottom();
    }
  }, [chat?.messages]);

  // Fetch chat history
  const fetchChat = async () => {
    const activeEmail = email || user?.email;
    if (!activeEmail) return;

    try {
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/chat/my-chat?email=${encodeURIComponent(activeEmail)}`, { headers });
      const data = await res.json();
      if (data.success && data.chat) {
        setChat(data.chat);
      }
    } catch (err) {
      console.error('Error fetching chat:', err);
    }
  };

  // Poll for new replies when widget is open and info is saved
  useEffect(() => {
    let interval;
    if (isOpen && (guestInfoSaved || user)) {
      fetchChat();
      interval = setInterval(fetchChat, 3000);
    }
    return () => clearInterval(interval);
  }, [isOpen, guestInfoSaved, user, email]);

  const handleStartChat = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setGuestInfoSaved(true);
    fetchChat();
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const activeName = name || user?.name || 'Customer';
    const activeEmail = email || user?.email || 'guest@blacktheory.com';

    setSending(true);
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/chat/send`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: activeName,
          email: activeEmail,
          text: message
        })
      });

      const data = await res.json();
      if (data.success) {
        setChat(data.chat);
        setMessage('');
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative flex items-center justify-center w-14 h-14 bg-neutral-900 text-white border border-neutral-700 rounded-full shadow-2xl hover:bg-neutral-800 hover:scale-105 transition-all duration-200 group"
          title="Live Customer Support"
        >
          <MessageSquare className="w-6 h-6 text-white group-hover:rotate-12 transition-transform duration-200" />
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
          </span>
        </button>
      )}

      {/* Chat Window Container */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[520px] bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="px-5 py-4 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center">
                <Headset className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide uppercase">Black Theory Support</h3>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[11px] text-neutral-400">Online • Typically replies instantly</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Step for Guest Info (if not logged in & not saved yet) */}
          {!isAuthenticated && !guestInfoSaved ? (
            <div className="flex-1 p-6 flex flex-col justify-center bg-neutral-950">
              <div className="text-center mb-6">
                <h4 className="text-base font-medium text-white">Welcome to Live Support</h4>
                <p className="text-xs text-neutral-400 mt-1">Please enter your contact details so our admin team can assist you.</p>
              </div>

              <form onSubmit={handleStartChat} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-neutral-400 mb-1">Your Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-neutral-400 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 bg-white text-black py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-neutral-200 transition"
                >
                  Start Chat
                </button>
              </form>
            </div>
          ) : (
            /* Chat Messages Area */
            <div className="flex-1 flex flex-col justify-between bg-neutral-950 overflow-hidden">
              <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar">
                {/* Intro bubble */}
                <div className="flex justify-start">
                  <div className="max-w-[82%] bg-neutral-900 border border-neutral-800 rounded-2xl rounded-tl-none p-3">
                    <p className="text-xs text-neutral-300">
                      Hello <span className="font-semibold text-white">{name || user?.name}</span>! How can we help you with your order or questions today?
                    </p>
                    <span className="text-[9px] text-neutral-500 mt-1 block">Black Theory Care</span>
                  </div>
                </div>

                {/* Message Log */}
                {chat?.messages?.map((msg, index) => {
                  const isUser = msg.senderRole === 'customer';
                  return (
                    <div
                      key={index}
                      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[82%] p-3 rounded-2xl text-xs ${
                          isUser
                            ? 'bg-neutral-800 text-white border border-neutral-700 rounded-tr-none'
                            : 'bg-neutral-900 text-neutral-200 border border-neutral-800 rounded-tl-none'
                        }`}
                      >
                        <p>{msg.text}</p>
                        <div className="flex items-center justify-between space-x-2 mt-1">
                          <span className="text-[9px] text-neutral-400 font-medium">{msg.senderName}</span>
                          <span className="text-[9px] text-neutral-500">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Form */}
              <form onSubmit={handleSendMessage} className="p-3 bg-neutral-900 border-t border-neutral-800 flex items-center space-x-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-700"
                />
                <button
                  type="submit"
                  disabled={sending || !message.trim()}
                  className="bg-white text-black p-2.5 rounded-xl hover:bg-neutral-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
