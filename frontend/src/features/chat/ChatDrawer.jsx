import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, Send, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../../stores/authContext';
import { connectSocket, disconnectSocket, getSocket } from '../../lib/socket';
import { messageService, socialService } from '../../services';

function formatTime(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ChatDrawer({ isOpen, onClose }) {
  const { user, token } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [contactId, setContactId] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const contact = useMemo(() => contacts.find((item) => item.id === contactId) || null, [contacts, contactId]);
  const threadId = useMemo(() => contact && user?.id ? [user.id, contact.id].sort().join(':') : '', [contact, user?.id]);

  useEffect(() => {
    if (!isOpen || !user?.id) return undefined;
    if (user.role !== 'player') {
      setError('Direct messaging is available to player accounts.');
      return undefined;
    }

    let active = true;
    setLoadingContacts(true);
    setError('');
    socialService.getRecommendedPlayers()
      .then((players) => {
        if (!active) return;
        setContacts(players);
        setContactId((current) => current || players[0]?.id || '');
      })
      .catch((err) => active && setError(err.message || 'Could not load players.'))
      .finally(() => active && setLoadingContacts(false));
    return () => { active = false; };
  }, [isOpen, user?.id, user?.role]);

  useEffect(() => {
    if (!isOpen || !threadId) {
      setMessages([]);
      return undefined;
    }
    let active = true;
    setLoadingMessages(true);
    setError('');
    messageService.getThread(threadId)
      .then((page) => active && setMessages(page.data || []))
      .catch((err) => active && setError(err.message || 'Could not load this conversation.'))
      .finally(() => active && setLoadingMessages(false));
    return () => { active = false; };
  }, [isOpen, threadId]);

  useEffect(() => {
    if (!isOpen || !user?.id || !token || !threadId) return undefined;
    const socket = connectSocket(user.id, token);
    const handleMessage = (message) => {
      if (message.sender_id === user.id || message.sender_id === contactId) {
        setMessages((current) => current.some((item) => item.id === message.id) ? current : [...current, message]);
      }
    };
    socket?.on('new_message', handleMessage);
    return () => socket?.off('new_message', handleMessage);
  }, [isOpen, user?.id, token, threadId, contactId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  useEffect(() => () => disconnectSocket(), []);

  const handleSend = async (event) => {
    event.preventDefault();
    const content = inputMsg.trim();
    if (!content || !threadId) return;
    setError('');
    try {
      const message = await messageService.sendMessage(threadId, content);
      setMessages((current) => [...current, message]);
      setInputMsg('');
    } catch (err) {
      setError(err.message || 'Message could not be sent.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full sm:w-96 rounded-3xl glass-modal border border-card-border shadow-2xl flex flex-col h-[480px] overflow-hidden animate-in slide-in-from-bottom-6">
      <div className="px-4 py-3 border-b border-card-border flex items-center gap-3 bg-surface-container-high/50">
        <div className="w-9 h-9 rounded-full bg-secondary/20 flex items-center justify-center text-secondary"><User className="w-4 h-4" /></div>
        <div className="min-w-0 flex-1">
          <label htmlFor="chat-contact" className="sr-only">Choose a player</label>
          <select id="chat-contact" value={contactId} onChange={(event) => setContactId(event.target.value)} disabled={loadingContacts || contacts.length === 0} className="w-full bg-transparent text-sm font-display font-bold text-on-surface focus:outline-none">
            {loadingContacts && <option value="">Loading players…</option>}
            {!loadingContacts && contacts.length === 0 && <option value="">No players available</option>}
            {contacts.map((player) => <option key={player.id} value={player.id}>{player.username}</option>)}
          </select>
          <span className="font-mono text-[10px] text-secondary uppercase font-semibold">Private player chat</span>
        </div>
        <button onClick={onClose} aria-label="Close chat" className="p-1 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"><X className="w-5 h-5" /></button>
      </div>

      {error && <div role="alert" className="px-4 py-2 flex gap-2 items-start text-xs text-error bg-error/10"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-surface-container-lowest/30" aria-live="polite">
        {loadingMessages && <p className="text-xs text-on-surface-variant">Loading conversation…</p>}
        {!loadingMessages && threadId && messages.length === 0 && <p className="text-xs text-on-surface-variant">Start the conversation with {contact?.username || 'this player'}.</p>}
        {messages.map((message) => {
          const isMe = message.sender_id === user?.id;
          return <div key={message.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[80%] px-3.5 py-2 rounded-2xl text-xs font-body leading-relaxed ${isMe ? 'bg-primary-container text-on-primary rounded-br-none shadow-glow' : 'bg-surface-container text-on-surface rounded-bl-none border border-card-border'}`}>{message.content}</div>
            <span className="font-mono text-[10px] text-on-surface-variant mt-0.5 px-1">{formatTime(message.created_at)}</span>
          </div>;
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-3 border-t border-card-border flex items-center gap-2 bg-surface-container-high/40">
        <input type="text" maxLength={10000} disabled={!threadId || loadingMessages} placeholder={contact ? `Message ${contact.username}…` : 'Choose a player'} value={inputMsg} onChange={(event) => setInputMsg(event.target.value)} className="flex-1 px-3.5 py-2 rounded-xl bg-surface-container-low border border-card-border text-on-surface placeholder:text-on-surface-variant text-xs focus:outline-none focus:border-primary font-body" />
        <button type="submit" disabled={!inputMsg.trim() || !threadId} aria-label="Send message" className="p-2 rounded-xl bg-primary-container text-on-primary hover:bg-primary-container/90 shadow-glow active:scale-95 transition-all disabled:opacity-50"><Send className="w-4 h-4" /></button>
      </form>
    </div>
  );
}
