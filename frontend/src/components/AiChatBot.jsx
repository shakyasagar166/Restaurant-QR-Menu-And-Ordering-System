import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  X,
  Sparkles,
  MessageCircle,
  UtensilsCrossed,
  Plus,
  Clock,
  Crown,
  Zap,
  Settings,
  Key,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { apiService } from '../api/apiService';
import { formatPrice } from '../utils/formatters';

export default function AiChatBot({
  tableNumber,
  menuItems = [],
  categories = [],
  activeCustomerOrder,
  onAddToCart,
  isCartBarVisible = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGroqActive, setIsGroqActive] = useState(false);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [groqKeyInput, setGroqKeyInput] = useState('');
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const currentAudioRef = useRef(null);

  const initialGreeting = `Namaste! 🙏 Main **Bikaner Express AI Assistant** hoon.\n\nMain aapki kya help kar sakti hoon? 😊\n• Kisi bhi dish ki **price (rate)** jaanni hai?\n• Ya koi dish abhi hamare restaurant me **available hai ya nahi** yeh jaanna hai?\n• Ya aapke **Table [${tableNumber || 'T-1'}]** ke order ka **live status** dekhna hai?`;

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: initialGreeting,
      audioUrl: '/audio/ai-greeting.mp3',
      items: [],
      poweredBy: 'Groq Cloud AI',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      checkGroqStatus();
    }
  }, [messages, isOpen]);

  // Load natural voices for Speech Synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      const onVoicesChanged = () => {
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.onvoiceschanged = onVoicesChanged;
      return () => {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.onvoiceschanged = null;
        }
      };
    }
  }, []);

  // Stop any ongoing voice (both audio file & speech synthesis)
  const stopSpeaking = () => {
    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
      } catch (e) {}
      currentAudioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
    setIsSpeaking(false);
  };

  // Play studio-recorded neural human voice audio file
  const playAudioFile = (url) => {
    if (!isVoiceEnabled) return;
    stopSpeaking();
    try {
      const audio = new Audio(url);
      currentAudioRef.current = audio;
      setIsSpeaking(true);
      audio.onended = () => {
        setIsSpeaking(false);
        currentAudioRef.current = null;
      };
      audio.onerror = () => {
        setIsSpeaking(false);
        currentAudioRef.current = null;
      };
      audio.play().catch((err) => {
        console.warn('Audio play error:', err);
        setIsSpeaking(false);
      });
    } catch (err) {
      setIsSpeaking(false);
    }
  };

  // Natural human Speech Synthesis for custom/dynamic answers
  const speakText = (text) => {
    if (!isVoiceEnabled || typeof window === 'undefined') return;

    // Check if we have a pre-recorded neural audio for this message
    if (text.includes('kya help kar sakti hoon')) {
      playAudioFile('/audio/ai-greeting.mp3');
      return;
    }
    if (text.includes('100% Pure Shuddh Shakahari')) {
      playAudioFile('/audio/ai-pure-veg.mp3');
      return;
    }
    if (text.includes('Signature Delights')) {
      playAudioFile('/audio/ai-special.mp3');
      return;
    }

    if (!('speechSynthesis' in window)) return;
    stopSpeaking();

    try {
      // Clean and format text for natural human pronunciation
      const clean = text
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/[•*#_-]/g, ' ')
        .replace(/₹/g, ' रुपए ')
        .replace(/\s+/g, ' ')
        .trim();

      if (!clean) return;

      const utterance = new SpeechSynthesisUtterance(clean);
      const voices = window.speechSynthesis.getVoices();

      // Prioritize modern Neural & Natural human voices
      const humanVoice =
        voices.find(
          (v) =>
            (v.name.includes('Natural') ||
              v.name.includes('Neural') ||
              v.name.includes('Google') ||
              v.name.includes('Online')) &&
            (v.lang.startsWith('hi') ||
              v.lang.includes('IN') ||
              v.name.toLowerCase().includes('hindi') ||
              v.name.toLowerCase().includes('india'))
        ) ||
        voices.find(
          (v) =>
            v.lang.startsWith('hi') ||
            v.lang.includes('IN') ||
            v.name.toLowerCase().includes('swara') ||
            v.name.toLowerCase().includes('neerja') ||
            v.name.toLowerCase().includes('hindi')
        ) ||
        voices.find(
          (v) =>
            v.name.includes('Natural') ||
            v.name.includes('Neural') ||
            v.name.includes('Google')
        );

      if (humanVoice) {
        utterance.voice = humanVoice;
      }

      // Natural conversational pacing (human speed & warm pitch)
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech error:', e);
      setIsSpeaking(false);
    }
  };

  const handleOpenChat = () => {
    setIsOpen(true);
    // Play ultra-realistic studio neural voice greeting
    setTimeout(() => {
      playAudioFile('/audio/ai-greeting.mp3');
    }, 250);
  };

  const handleCloseChat = () => {
    stopSpeaking();
    setIsOpen(false);
  };

  const checkGroqStatus = async () => {
    try {
      const status = await apiService.getGroqStatus();
      setIsGroqActive(status?.configured || false);
    } catch {
      setIsGroqActive(false);
    }
  };

  const handleSaveGroqKey = async (e) => {
    e.preventDefault();
    if (!groqKeyInput.trim()) return;
    try {
      const res = await apiService.updateGroqKey(groqKeyInput.trim());
      setIsGroqActive(res?.configured || true);
      setShowKeyInput(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender: 'bot',
          text: '⚡ **Groq Cloud API Key successfully connected!** Ab Groq AI ultra-fast speed me Hindi aur Hinglish answers dega.',
          items: [],
          poweredBy: 'Groq Cloud',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setGroqKeyInput('');
    } catch (err) {
      alert('Could not save Groq key: ' + err.message);
    }
  };

  const quickPrompts = [
    '🍛 Paneer Butter Masala ka rate kya hai?',
    '🔍 Kya Dal Makhani available hai?',
    '🫓 Tandoori Roti aur Naan ke rates',
    '🥤 Cold Coffee aur Drinks ke rates',
    '🍱 Bikaner Special Thali Details',
    '🌿 Kya 100% Pure Veg hai?',
    '🕒 Mere Table ka Order Status',
  ];

  // Client-side instant NLP fallback
  const clientNlpAnswer = (query) => {
    const lower = query.toLowerCase();
    let reply = '';
    let suggestedItems = [];
    let audioUrl = null;

    // Non-veg check
    if (
      lower.includes('chicken') ||
      lower.includes('mutton') ||
      lower.includes('fish') ||
      lower.includes('non veg') ||
      lower.includes('nonveg')
    ) {
      reply =
        '🌿 **Bikaner Express 100% Pure Shuddh Shakahari (Pure Veg) Restaurant hai.** Yahan non-veg bilkul nahi banta. Lekin aap hamari Tandoori Malai Chaap ya Paneer Tikka try kar sakte hain!';
      suggestedItems = (menuItems || []).filter(
        (m) => m.name.includes('Chaap') || m.name.includes('Paneer Tikka')
      );
      audioUrl = '/audio/ai-pure-veg.mp3';
      return { reply, items: suggestedItems, audioUrl };
    }

    // Alcohol check
    if (
      lower.includes('beer') ||
      lower.includes('wine') ||
      lower.includes('alcohol') ||
      lower.includes('daroo')
    ) {
      reply =
        '🍹 **Bikaner Express me alcohol serve nahi hoti.** Hamare paas refreshing **Virgin Mojito, Kala Khatta, Cold Coffee with Ice Cream aur Kesar Badam Milk** available hain!';
      suggestedItems = (menuItems || [])
        .filter((m) => m.category === 'Mocktails' || m.name.includes('Cold Coffee'))
        .slice(0, 3);
      return { reply, items: suggestedItems };
    }

    // Order status check
    if (
      lower.includes('order') &&
      (lower.includes('status') ||
        lower.includes('kahan') ||
        lower.includes('kab') ||
        lower.includes('check'))
    ) {
      if (activeCustomerOrder) {
        reply = `📋 **Aapka Table [${activeCustomerOrder.tableNumber}] ka Order #${activeCustomerOrder.id} (${formatPrice(activeCustomerOrder.totalAmount)}) abhi [${activeCustomerOrder.status}] status me hai!**\n\nKitchen staff aapka khana taaza prepare kar rahe hain.`;
      } else {
        reply = `Aapki table (${tableNumber}) ka abhi koi active order submit nahi hua hai. Menu se dishes add karke aap order place kar sakte hain!`;
      }
      return { reply, items: [] };
    }

    // Bread rates
    if (
      lower.includes('roti') ||
      lower.includes('naan') ||
      lower.includes('kulcha') ||
      lower.includes('paratha')
    ) {
      const breads = (menuItems || []).filter((m) => m.category === 'Indian Breads');
      reply =
        `🫓 **Indian Breads (Clay Oven Tandoor):**\n` +
        breads.map((b) => `• **${b.name}**: ${formatPrice(b.price)}`).join('\n') +
        `\n\nSabhi rotis aur naans tandoor me desi butter ke saath taaza banayi jaati hain!`;
      return { reply, items: breads.slice(0, 3) };
    }

    // Drinks
    if (
      lower.includes('drink') ||
      lower.includes('coffee') ||
      lower.includes('beverage') ||
      lower.includes('chai')
    ) {
      const drinks = (menuItems || []).filter((m) => m.category === 'Beverages');
      reply =
        `🥤 **Beverages & Drinks Rates:**\n` +
        drinks.map((d) => `• **${d.name}**: ${formatPrice(d.price)}`).join('\n');
      return { reply, items: drinks.slice(0, 3) };
    }

    // Search dish
    const matched = (menuItems || []).filter(
      (m) =>
        lower.includes(m.name.toLowerCase()) || m.name.toLowerCase().includes(lower)
    );
    if (matched.length > 0) {
      const dish = matched[0];
      reply = `✨ **${dish.name}** hamare restaurant me **AVAILABLE** hai!\n\n• **Price**: ${formatPrice(dish.price)}\n• **Category**: ${dish.category}\n• **Description**: ${dish.description}`;
      return { reply, items: [dish] };
    }

    // Availability inquiry when item is NOT matched
    if (
      lower.includes('hai ya nahi') ||
      lower.includes('available hai') ||
      lower.includes('milega kya') ||
      lower.includes('mil jayega')
    ) {
      reply = `🔍 Hamare live menu me yeh dish uplabdh nahi mili. Hamare paas 86+ authentic delicacies jaise **Paneer Butter Masala**, **Dal Makhani**, **Tandoori Chaap**, aur **Special Thali** available hain!`;
      return { reply, items: [] };
    }

    // Recommendations
    if (
      lower.includes('recommend') ||
      lower.includes('special') ||
      lower.includes('kya khaye') ||
      lower.includes('best')
    ) {
      reply = `👑 **Bikaner Express Signature Delights:**\n\n1. **Paneer Butter Masala** (₹385) + **Garlic Naan** (₹105)\n2. **Dal Makhani** (₹325)\n3. **Tandoori Malai Chaap** (₹290)\n4. **Virgin Mojito** (₹160)\n5. **Gulab Jamun with Ice Cream** (₹120)`;
      suggestedItems = (menuItems || [])
        .filter((m) => m.tag === 'Bestseller' || m.tag === 'Chef Special')
        .slice(0, 3);
      audioUrl = '/audio/ai-special.mp3';
      return { reply, items: suggestedItems, audioUrl };
    }

    reply = `Namaste! Bikaner Express rooftop me aapka swagat hai. Main aapki kya help kar sakti hoon? Kisi bhi dish ka price (rate), availability, ya Table [${tableNumber}] ke order status ke baare me pooch sakte hain!`;
    return { reply, items: [] };
  };

  const handleSend = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: text.trim(),
      items: [],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const backendRes = await apiService.sendChatMessage(
        text.trim(),
        tableNumber,
        activeCustomerOrder?.id
      );

      let botReply = '';
      let botItems = [];
      let botAudioUrl = null;
      let poweredBy = backendRes?.poweredBy || 'Groq Cloud';

      if (backendRes && backendRes.reply) {
        botReply = backendRes.reply;
        botItems = backendRes.items || [];
      } else {
        const nlp = clientNlpAnswer(text.trim());
        botReply = nlp.reply;
        botItems = nlp.items || [];
        botAudioUrl = nlp.audioUrl || null;
        poweredBy = 'Bikaner AI Engine';
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: botReply,
          items: botItems,
          audioUrl: botAudioUrl,
          poweredBy,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);

      if (isVoiceEnabled) {
        if (botAudioUrl) {
          playAudioFile(botAudioUrl);
        } else if (botReply) {
          speakText(botReply);
        }
      }
    } catch (err) {
      const nlp = clientNlpAnswer(text.trim());
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: nlp.reply,
          items: nlp.items || [],
          audioUrl: nlp.audioUrl || null,
          poweredBy: 'Bikaner AI Engine',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);

      if (isVoiceEnabled) {
        if (nlp.audioUrl) {
          playAudioFile(nlp.audioUrl);
        } else if (nlp.reply) {
          speakText(nlp.reply);
        }
      }
    } finally {
      setIsTyping(false);
    }
  };

  const renderMessageContent = (text, isUser) => {
    if (!text) return null;
    return text.split('\n').map((line, lIdx) => {
      if (!line.trim()) {
        return <div key={lIdx} className="h-1.5" />;
      }
      const isBullet =
        line.trim().startsWith('•') || line.trim().startsWith('*') || line.trim().startsWith('-');
      const cleanLine = isBullet ? line.trim().replace(/^([•*-]\s*)/, '') : line;
      const parts = cleanLine.split(/(\*\*.*?\*\*)/g);

      return (
        <div key={lIdx} className={`my-0.5 ${isBullet ? 'flex items-start gap-1.5 pl-1.5' : ''}`}>
          {isBullet && (
            <span
              className={`${
                isUser ? 'text-amber-300' : 'text-amber-600'
              } font-black shrink-0 mt-0.5`}
            >
              •
            </span>
          )}
          <div>
            {parts.map((part, pIdx) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return (
                  <strong
                    key={pIdx}
                    className={`font-black ${isUser ? 'text-amber-200' : 'text-stone-900'}`}
                  >
                    {part.slice(2, -2)}
                  </strong>
                );
              }
              return <span key={pIdx}>{part}</span>;
            })}
          </div>
        </div>
      );
    });
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <div
          className={`fixed ${
            isCartBarVisible ? 'bottom-24 sm:bottom-24' : 'bottom-6 sm:bottom-6'
          } right-4 sm:right-6 z-30 transition-all duration-300`}
        >
          <button
            onClick={handleOpenChat}
            className="group relative flex items-center gap-2.5 bg-gradient-to-r from-stone-950 via-red-950 to-stone-900 text-white pl-4 pr-5 py-3 rounded-full shadow-2xl border-2 border-amber-400 hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 text-stone-950 flex items-center justify-center font-bold text-sm shadow-md animate-pulse">
              <Bot className="w-5 h-5 text-stone-950" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-brand font-black text-amber-300">
                  Ask Groq AI 🎙️
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              </div>
              <span className="text-[10px] text-stone-300 block leading-tight">
                Rates &amp; Availability
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Expanded AI Chat Modal / Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:right-6 sm:w-[430px] h-[600px] max-h-[85vh] z-50 bg-white rounded-3xl shadow-2xl border-2 border-amber-400/80 flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-stone-950 via-red-950 to-stone-950 text-white p-4 border-b border-amber-400/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-stone-950 flex items-center justify-center font-bold shadow-md">
                    <Bot className="w-6 h-6 text-stone-950" />
                  </div>
                  {isSpeaking && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-brand font-black text-sm text-white">
                      Bikaner AI Concierge
                    </h4>
                    <span className="text-[9px] bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 font-black px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                      <Zap className="w-2.5 h-2.5" />
                      Groq AI
                    </span>
                  </div>
                  <p className="text-[10px] text-amber-200">
                    {tableNumber || 'Table T-1'} • Aman International Mall Rooftop
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Voice Audio Toggle Button */}
                <button
                  onClick={() => {
                    if (isVoiceEnabled) {
                      stopSpeaking();
                      setIsVoiceEnabled(false);
                    } else {
                      setIsVoiceEnabled(true);
                      playAudioFile('/audio/ai-greeting.mp3');
                    }
                  }}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition ${
                    isVoiceEnabled
                      ? 'bg-amber-400 text-stone-950 hover:bg-amber-500'
                      : 'bg-white/10 hover:bg-white/20 text-stone-400'
                  }`}
                  title={isVoiceEnabled ? 'Voice Chalu Hai (Mute Karein)' : 'Voice Band Hai (Unmute Karein)'}
                >
                  {isVoiceEnabled ? (
                    <Volume2 className="w-3.5 h-3.5" />
                  ) : (
                    <VolumeX className="w-3.5 h-3.5" />
                  )}
                </button>

                <button
                  onClick={() => setShowKeyInput(!showKeyInput)}
                  className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white flex items-center justify-center transition"
                  title="Configure Groq API Key"
                >
                  <Key className="w-3.5 h-3.5 text-amber-300" />
                </button>
                <button
                  onClick={handleCloseChat}
                  className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white flex items-center justify-center transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Speaking Status Pill */}
            {isSpeaking && (
              <div className="mt-2 flex items-center justify-between bg-amber-400/20 border border-amber-400/40 rounded-xl px-2.5 py-1 text-[11px] text-amber-200 animate-pulse">
                <span className="flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
                  Natural Voice Speaking...
                </span>
                <button
                  onClick={stopSpeaking}
                  className="text-[10px] text-amber-300 underline font-bold"
                >
                  Stop
                </button>
              </div>
            )}

            {/* Groq Key Configuration Banner if toggled */}
            {showKeyInput && (
              <form
                onSubmit={handleSaveGroqKey}
                className="mt-3 pt-3 border-t border-white/10 flex gap-2"
              >
                <input
                  type="password"
                  placeholder="Paste Groq API Key (gsk_...)"
                  value={groqKeyInput}
                  onChange={(e) => setGroqKeyInput(e.target.value)}
                  className="flex-1 bg-white/15 border border-white/20 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
                <button
                  type="submit"
                  className="bg-amber-400 hover:bg-amber-500 text-stone-950 font-brand font-black text-xs px-3 py-1.5 rounded-xl transition"
                >
                  Save
                </button>
              </form>
            )}
          </div>

          {/* Quick Prompts Bar */}
          <div className="bg-stone-100/90 px-3 py-2 border-b border-stone-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                className="whitespace-nowrap bg-white hover:bg-amber-100 text-stone-800 text-[10px] font-bold px-2.5 py-1 rounded-xl border border-stone-200 hover:border-amber-400 transition"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-stone-50/50 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl p-3.5 leading-relaxed shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-red-800 to-red-950 text-white rounded-br-xs'
                      : 'bg-white text-stone-800 border border-amber-200/80 rounded-bl-xs'
                  }`}
                >
                  <div className="leading-relaxed">
                    {renderMessageContent(msg.text, msg.sender === 'user')}
                  </div>

                  {/* Interactive dish cards in AI replies */}
                  {msg.items && msg.items.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-amber-100 space-y-2">
                      <span className="text-[10px] font-brand font-black uppercase text-amber-800 tracking-wider block">
                        Quick Add to Order Tray:
                      </span>
                      {msg.items.map((item) => (
                        <div
                          key={item.id}
                          className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-2 flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-9 h-9 rounded-lg object-cover shrink-0"
                            />
                            <div className="truncate">
                              <span className="font-bold text-stone-900 block truncate text-[11px]">
                                {item.name}
                              </span>
                              <span className="text-amber-900 font-extrabold text-[10px]">
                                {formatPrice(item.price)}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => onAddToCart(item)}
                            className="bg-gradient-to-r from-red-800 to-red-900 hover:from-red-900 hover:to-black text-white font-brand font-black text-[10px] px-2.5 py-1 rounded-lg shrink-0 flex items-center gap-1 shadow-xs transition"
                          >
                            <Plus className="w-3 h-3 text-amber-300" />
                            <span>Add</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Message Bottom Footer: Speak Button & PoweredBy */}
                  {msg.sender === 'bot' && (
                    <div className="mt-2.5 pt-1.5 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-500">
                      {msg.poweredBy && (
                        <div className="text-[9px] text-amber-700/80 flex items-center gap-1 font-semibold">
                          <Zap className="w-2.5 h-2.5 text-amber-600" />
                          <span>{msg.poweredBy}</span>
                        </div>
                      )}
                      <button
                        onClick={() => {
                          if (msg.audioUrl) {
                            playAudioFile(msg.audioUrl);
                          } else {
                            speakText(msg.text);
                          }
                        }}
                        className="flex items-center gap-1 text-[10px] text-amber-800 hover:text-amber-950 font-bold bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-md transition"
                        title="Sunne ke liye click karein"
                      >
                        <Volume2 className="w-3 h-3 text-amber-600" />
                        <span>Sunein</span>
                      </button>
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-stone-400 mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-stone-500 bg-white border border-stone-200 rounded-2xl px-3 py-2 w-fit">
                <Bot className="w-3.5 h-3.5 animate-spin text-amber-600" />
                <span className="text-[11px] font-medium">Groq AI jawab likh rahi hai...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-stone-200 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Dish ka rate, availability, ya status poochein..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="flex-1 bg-stone-100 border border-stone-200 rounded-2xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isTyping}
                className="w-9 h-9 rounded-2xl bg-gradient-to-r from-red-800 to-amber-700 hover:from-red-900 hover:to-amber-800 text-white flex items-center justify-center transition disabled:opacity-40 shadow-sm shrink-0"
              >
                <Send className="w-4 h-4 text-amber-300" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
