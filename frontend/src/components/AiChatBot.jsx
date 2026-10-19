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
  ArrowLeft,
  Minus,
  ShoppingBag,
  CheckCircle2,
} from 'lucide-react';
import { apiService } from '../api/apiService';
import { formatPrice } from '../utils/formatters';

export default function AiChatBot({
  tableNumber,
  menuItems = [],
  categories = [],
  activeCustomerOrder,
  onAddToCart,
  onRemoveFromCart,
  cart = [],
  onOpenCart,
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

  // Populate initial greeting with signature dishes so diner can + Add directly
  useEffect(() => {
    if (menuItems && menuItems.length > 0) {
      const topDishes = menuItems
        .filter(
          (m) =>
            m.name.includes('Paneer Butter Masala') ||
            m.name.includes('Dal Makhani') ||
            m.name.includes('Special Thali') ||
            m.tag === 'Bestseller'
        )
        .slice(0, 3);

      setMessages((prev) => {
        if (prev.length > 0 && prev[0].id === 1 && (!prev[0].items || prev[0].items.length === 0)) {
          const updated = [...prev];
          updated[0] = { ...updated[0], items: topDishes };
          return updated;
        }
        return prev;
      });
    }
  }, [menuItems]);

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

      // Automatic Dish Recognition across entire menu
      const scanCombined = `${text} ${botReply}`.toLowerCase();
      const detectedMenuDishes = [];
      if (menuItems && menuItems.length > 0) {
        for (const dish of menuItems) {
          if (!dish || !dish.name) continue;
          const dishLower = dish.name.toLowerCase();
          if (scanCombined.includes(dishLower)) {
            if (!detectedMenuDishes.some((d) => d.id === dish.id)) {
              detectedMenuDishes.push(dish);
            }
          }
        }
      }

      // Direct Natural Language "Add to Cart / Order" recognition
      const isAddCommand = /(add|order|daal do|dal do|jod do|shamil|lao|chahiye|mangwa)/i.test(text);
      if (isAddCommand && detectedMenuDishes.length > 0 && onAddToCart) {
        const dishToAutoAdd = detectedMenuDishes[0];
        onAddToCart(dishToAutoAdd);
        botReply = `${botReply}\n\n✨ **${dishToAutoAdd.name}** aapki Table Tray me **ADD** ho gayi hai! Neeche button par click karke tray dekhein.`;
      }

      // Merge backend items and detected items
      const finalItems = [...(botItems || [])];
      for (const d of detectedMenuDishes) {
        if (!finalItems.some((i) => i.id === d.id)) {
          finalItems.push(d);
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: botReply,
          items: finalItems,
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
      let catchReply = nlp.reply;
      const scanCombined = `${text} ${catchReply}`.toLowerCase();
      const detectedMenuDishes = [];
      if (menuItems && menuItems.length > 0) {
        for (const dish of menuItems) {
          if (!dish || !dish.name) continue;
          const dishLower = dish.name.toLowerCase();
          if (scanCombined.includes(dishLower)) {
            if (!detectedMenuDishes.some((d) => d.id === dish.id)) {
              detectedMenuDishes.push(dish);
            }
          }
        }
      }

      const isAddCommand = /(add|order|daal do|dal do|jod do|shamil|lao|chahiye|mangwa)/i.test(text);
      if (isAddCommand && detectedMenuDishes.length > 0 && onAddToCart) {
        const dishToAutoAdd = detectedMenuDishes[0];
        onAddToCart(dishToAutoAdd);
        catchReply = `${catchReply}\n\n✨ **${dishToAutoAdd.name}** aapki Table Tray me **ADD** ho gayi hai!`;
      }

      const finalCatchItems = [...(nlp.items || [])];
      for (const d of detectedMenuDishes) {
        if (!finalCatchItems.some((i) => i.id === d.id)) {
          finalCatchItems.push(d);
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: catchReply,
          items: finalCatchItems,
          audioUrl: nlp.audioUrl || null,
          poweredBy: 'Bikaner AI Engine',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);

      if (isVoiceEnabled) {
        if (nlp.audioUrl) {
          playAudioFile(nlp.audioUrl);
        } else if (catchReply) {
          speakText(catchReply);
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
      {/* Floating Launcher Button (Compact on Mobile, Full Pill on Desktop to prevent covering dishes) */}
      {!isOpen && (
        <div
          className={`fixed ${
            isCartBarVisible ? 'bottom-24 sm:bottom-24' : 'bottom-6 sm:bottom-6'
          } right-3 sm:right-6 z-30 transition-all duration-300 pointer-events-auto`}
        >
          {/* Mobile View: Compact luxury round badge (Takes only 50px space, never blocks dishes) */}
          <button
            onClick={handleOpenChat}
            className="sm:hidden relative flex items-center justify-center w-12 h-12 bg-gradient-to-br from-stone-950 via-red-950 to-stone-900 text-white rounded-full shadow-2xl border-2 border-amber-400 active:scale-95 transition-all"
            title="Ask Groq AI Assistant (दिश की जानकारी व रेट पूछें)"
            aria-label="Ask Groq AI"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 text-stone-950 flex items-center justify-center font-bold text-sm shadow-md animate-pulse">
              <Bot className="w-4.5 h-4.5 text-stone-950" />
            </div>
            <span className="absolute -top-1 -right-1 bg-red-600 text-[8px] font-black text-amber-200 px-1 py-0.2 rounded-full border border-stone-950 shadow-xs">
              AI 🎙️
            </span>
          </button>

          {/* Desktop & Tablet View: Full Luxury Pill */}
          <button
            onClick={handleOpenChat}
            className="hidden sm:flex group relative items-center gap-2.5 bg-gradient-to-r from-stone-950 via-red-950 to-stone-900 text-white pl-4 pr-5 py-3 rounded-full shadow-2xl border-2 border-amber-400 hover:scale-105 active:scale-95 transition-all duration-300"
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
        <div className="fixed inset-x-2 bottom-2 sm:inset-x-auto sm:bottom-4 sm:right-6 sm:w-[420px] h-[86vh] sm:h-[600px] max-h-[88vh] z-50 bg-white rounded-3xl shadow-2xl border-2 border-amber-400/80 flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-stone-950 via-red-950 to-stone-950 text-white p-3 sm:p-4 border-b border-amber-400/30">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-2.5 truncate">
                <button
                  onClick={handleCloseChat}
                  className="flex items-center gap-1 bg-white/15 hover:bg-white/25 text-amber-300 hover:text-white px-2 py-1 rounded-xl text-xs font-bold transition active:scale-95 border border-white/10 shrink-0"
                  title="Menu par wapas jayein"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-amber-300" />
                  <span className="text-[11px]">← Back</span>
                </button>
                <div className="relative shrink-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-stone-950 flex items-center justify-center font-bold shadow-md">
                    <Bot className="w-4 h-4 sm:w-6 sm:h-6 text-stone-950" />
                  </div>
                  {isSpeaking && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
                  )}
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-1.5 truncate">
                    <h4 className="font-brand font-black text-xs sm:text-sm text-white truncate">
                      Bikaner AI
                    </h4>
                    <span className="text-[8px] sm:text-[9px] bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 font-black px-1.5 py-0.2 rounded-md shrink-0">
                      ⚡ Groq
                    </span>
                  </div>
                  <p className="text-[9px] sm:text-[10px] text-amber-200 truncate">
                    {tableNumber || 'Table T-1'} • Rooftop Concierge
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
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-brand font-black uppercase text-amber-900 tracking-wider flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-600" />
                          <span>Quick Add to Table Tray:</span>
                        </span>
                        <span className="text-[9px] text-stone-500 font-medium">
                          1-Tap Order
                        </span>
                      </div>
                      {msg.items.map((item) => {
                        const inCart = (cart || []).find((c) => c.id === item.id);
                        const qty = inCart ? inCart.quantity : 0;

                        return (
                          <div
                            key={item.id}
                            className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-2.5 flex items-center justify-between gap-2.5 shadow-2xs hover:border-amber-400 transition"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-10 h-10 rounded-xl object-cover shrink-0 border border-amber-200 shadow-2xs"
                              />
                              <div className="truncate">
                                <span className="font-brand font-black text-stone-900 block truncate text-xs">
                                  {item.name}
                                </span>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="text-red-700 font-black text-xs font-sans">
                                    {formatPrice(item.price)}
                                  </span>
                                  {item.category && (
                                    <span className="text-[9px] text-stone-500 bg-white/80 px-1.5 py-0.2 rounded border border-stone-200">
                                      {item.category}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Quantity Controls / Add Button */}
                            {qty > 0 ? (
                              <div className="flex items-center gap-1 bg-emerald-700 text-white rounded-xl p-0.5 shadow-xs shrink-0">
                                <button
                                  type="button"
                                  onClick={() => onRemoveFromCart && onRemoveFromCart(item.id)}
                                  className="w-6 h-6 flex items-center justify-center hover:bg-emerald-800 rounded-lg text-white font-black transition active:scale-90 cursor-pointer"
                                  title="Kam karein"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="font-brand font-black text-xs px-1 text-white select-none">
                                  {qty}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => onAddToCart(item)}
                                  className="w-6 h-6 flex items-center justify-center hover:bg-emerald-800 rounded-lg text-white font-black transition active:scale-90 cursor-pointer"
                                  title="Badhayein"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => onAddToCart(item)}
                                className="bg-gradient-to-r from-red-800 via-red-900 to-stone-950 hover:from-red-900 hover:to-black text-white font-brand font-black text-[11px] px-3 py-1.5 rounded-xl shrink-0 flex items-center gap-1 shadow-md transition active:scale-95 border border-amber-400 cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5 text-amber-300" />
                                <span>+ Add</span>
                              </button>
                            )}
                          </div>
                        );
                      })}

                      {/* Shortcut to View Cart / Tray if anything added */}
                      {cart && cart.length > 0 && onOpenCart && (
                        <button
                          type="button"
                          onClick={onOpenCart}
                          className="mt-2.5 w-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-brand font-black text-xs py-2 px-3 rounded-xl flex items-center justify-between shadow-md transition active:scale-98 cursor-pointer border border-amber-300"
                        >
                          <span className="flex items-center gap-1.5">
                            <ShoppingBag className="w-3.5 h-3.5 text-stone-950" />
                            <span>Table Tray ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                          </span>
                          <span className="text-stone-950 font-bold flex items-center gap-1">
                            <span className="text-red-950 font-black">₹{cart.reduce((s, i) => s + i.price * i.quantity, 0)}</span>
                            <span>• View Tray ➔</span>
                          </span>
                        </button>
                      )}
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

          {/* Pinned Quick Tray Bar if items are added */}
          {cart && cart.length > 0 && onOpenCart && (
            <div className="px-3.5 py-2 bg-gradient-to-r from-stone-950 via-red-950 to-stone-900 border-t border-amber-400/40 flex items-center justify-between text-white font-brand shrink-0">
              <div className="flex items-center gap-2 text-xs font-black">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-stone-200">
                  {cart.reduce((s, i) => s + i.quantity, 0)} Items in Tray
                </span>
                <span className="text-amber-300 font-mono font-bold text-xs bg-white/10 px-1.5 py-0.2 rounded">
                  ₹{cart.reduce((s, i) => s + i.price * i.quantity, 0)}
                </span>
              </div>
              <button
                type="button"
                onClick={onOpenCart}
                className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-brand font-black text-[11px] px-3 py-1 rounded-xl shadow-xs transition active:scale-95 flex items-center gap-1 cursor-pointer"
              >
                <span>View Tray &amp; Order</span>
                <span>➔</span>
              </button>
            </div>
          )}

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
