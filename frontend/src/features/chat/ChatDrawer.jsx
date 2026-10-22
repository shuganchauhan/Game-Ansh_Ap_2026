import React, { useState, useEffect, useRef } from 'react';
import { X, Send, User, Circle } from 'lucide-react';
import { useAuth } from '../../stores/authContext';
import { useGameStore } from '../../stores/gameStore';
import { connectSocket, getSocket } from '../../lib/socket';
import { messageService } from '../../services';

export default function ChatDrawer({ isOpen, onClose }) {
  const { user } = useAuth();
  const { currentUser } = useGameStore();
  const effectiveUserId = user?.id || currentUser?.id || 'player-me';

  const [messages, setMessages] = useState([
    {
      id: 'm-1',
      sender_id: 'other-user',
      sender_name: 'Mortal (S8UL)',
      content: 'Hey Alex, saw your Immortal 3 VOD review. Are you available for trial scrims tomorrow at 7 PM IST?',
      created_at: '19:42',
    },
    {
      id: 'm-2',
      sender_id: effectiveUserId,
      sender_name: 'Me',
      content: 'Hey Mortal! Yes, 7 PM IST works great. Ready to run controller or flex duelist.',
      created_at: '19:44',
    },
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (user?.id) {
      const socket = connectSocket(user.id);
      if (socket) {
        socket.on('new_message', (msg) => {
          setMessages((prev) => [...prev, msg]);
        });
      }
    }
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const newMsg = {
      id: `msg-${Date.now()}`,
      sender_id: user?.id || 'me',
      sender_name: 'Me',
      content: inputMsg,
      created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    const textToSend = inputMsg;
    setInputMsg('');

    try {
      const threadId = 'demo-thread';
      await messageService.sendMessage(threadId, 'other-user', textToSend).catch(() => {});
    } catch {
      // optimistic update already shown
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full sm:w-96 rounded-3xl glass-modal border border-card-border shadow-2xl flex flex-col h-[480px] overflow-hidden animate-in slide-in-from-bottom-6">
      {/* Header */}
      <div className="px-5 py-4 border-b border-card-border flex items-center justify-between bg-surface-container-high/50">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center font-display font-bold text-xs text-secondary">
              M
            </div>
            <Circle className="w-2.5 h-2.5 fill-secondary text-secondary absolute -bottom-0.5 -right-0.5" />
          </div>
          <div>
            <h4 className="font-display font-bold text-sm text-on-surface">Mortal</h4>
            <span className="font-mono text-[10px] text-secondary uppercase font-semibold">Online • Team Soul / S8UL</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-surface-container-lowest/30">
        {messages.map((m) => {
          const isMe = m.sender_id === (user?.id || 'me');
          return (
            <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-[80%] px-3.5 py-2 rounded-2xl text-xs font-body leading-relaxed ${
                  isMe
                    ? 'bg-primary-container text-on-primary rounded-br-none shadow-glow'
                    : 'bg-surface-container text-on-surface rounded-bl-none border border-card-border'
                }`}
              >
                {m.content}
              </div>
              <span className="font-mono text-[10px] text-on-surface-variant mt-0.5 px-1">{m.created_at}</span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 border-t border-card-border flex items-center gap-2 bg-surface-container-high/40">
        <input
          type="text"
          placeholder="Type your message..."
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          className="flex-1 px-3.5 py-2 rounded-xl bg-surface-container-low border border-card-border text-on-surface placeholder:text-on-surface-variant text-xs focus:outline-none focus:border-primary font-body"
        />
        <button
          type="submit"
          className="p-2 rounded-xl bg-primary-container text-on-primary hover:bg-primary-container/90 shadow-glow active:scale-95 transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
