"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Mic, MicOff, ArrowRight } from 'lucide-react';
import { API_URL } from '../context/AuthContext';

export default function SearchOverlay({ isOpen, onClose }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // Fetch search suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim().length > 1) {
        try {
          const res = await fetch(`${API_URL}/products/suggestions?q=${query}`);
          const data = await res.json();
          if (data.success) {
            setSuggestions(data.data);
          }
        } catch (err) {
          console.error(err);
        }
      } else {
        setSuggestions([]);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (query.trim()) {
      router.push(`/shop?search=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  const handleSuggestionClick = (name) => {
    router.push(`/shop?search=${encodeURIComponent(name)}`);
    onClose();
  };

  // Voice search helper
  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      // Fallback: Simulate voice search
      setIsListening(true);
      setTimeout(() => {
        setQuery('Oversized Heavyweight');
        setIsListening(false);
      }, 2000);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      setQuery(speechToText);
      setIsListening(false);
    };

    recognition.start();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-brand-black/95 backdrop-blur-md flex flex-col justify-start pt-24 px-6 md:px-24">
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-2 rounded-full border border-brand-grey hover:bg-brand-grey/50 transition-colors text-white"
        aria-label="Close search overlay"
      >
        <X size={24} />
      </button>

      <div className="max-w-3xl w-full mx-auto" ref={overlayRef}>
        <form onSubmit={handleSearchSubmit} className="relative border-b border-brand-grey pb-4">
          <input
            type="text"
            placeholder={isListening ? "Listening for voice input..." : "SEARCH BLACK THEORY..."}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-white font-display text-2xl md:text-4xl uppercase tracking-wider outline-none pr-16 pl-2"
            autoFocus
          />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center space-x-4">
            <button
              type="button"
              onClick={handleVoiceSearch}
              className={`p-2 rounded-full transition-all ${isListening ? 'bg-red-600 animate-pulse text-white' : 'text-neutral-400 hover:text-white'}`}
              title="Voice Search"
            >
              {isListening ? <MicOff size={24} /> : <Mic size={24} />}
            </button>
            <button type="submit" className="text-neutral-400 hover:text-white transition-colors">
              <ArrowRight size={28} />
            </button>
          </div>
        </form>

        {/* Suggestions & Results */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 text-white">
          <div>
            <h3 className="font-display text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-4">Trending Searches</h3>
            <ul className="space-y-3 font-display">
              {['Obsidian Heavyweight', 'Denim', 'Hoodie', 'Oversized', 'Cargo Joggers'].map((term, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleSuggestionClick(term)}
                    className="text-lg hover:text-neutral-300 transition-colors flex items-center space-x-2"
                  >
                    <Search size={16} className="text-neutral-500" />
                    <span>{term}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            {suggestions.length > 0 ? (
              <div>
                <h3 className="font-display text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-4">Suggestions</h3>
                <ul className="space-y-3">
                  {suggestions.map((item) => (
                    <li key={item._id}>
                      <button
                        onClick={() => handleSuggestionClick(item.name)}
                        className="text-left w-full hover:text-neutral-300 font-display transition-colors py-1 border-b border-neutral-900 flex justify-between items-center"
                      >
                        <span className="truncate">{item.name}</span>
                        <span className="text-xs text-neutral-500 uppercase tracking-wider">{item.category}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : query.trim() ? (
              <div className="text-neutral-500 font-display italic">
                Press Enter to search for &quot;{query}&quot;
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
