import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { 
  sendGroupMessage, 
  sendPrivateMessage, 
  subscribeToGroupMessages, 
  subscribeToPrivateMessages 
} from '../services/chatService';
import { Users, User, Send, MessageSquare, Loader2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Messages() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialUserId = searchParams.get('user');

  const [activeChat, setActiveChat] = useState(initialUserId ? { type: 'private', id: initialUserId } : { type: 'group', id: currentUser?.course || 'General' });
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isChatOpenMobile, setIsChatOpenMobile] = useState(!!initialUserId);

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };
  
  const messagesEndRef = useRef(null);

  // Fetch all users for the sidebar (so they can DM anyone)
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const usersList = [];
        querySnapshot.forEach((doc) => {
          if (doc.id !== currentUser.uid) {
            usersList.push({ id: doc.id, ...doc.data() });
          }
        });
        setAllUsers(usersList);
      } catch (error) {
        console.error("Error fetching users for chat sidebar:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentUser, navigate]);

  // Subscribe to the active chat's messages
  useEffect(() => {
    if (!currentUser) return;
    
    let unsubscribe;
    setMessages([]); // Clear while loading new chat
    
    if (activeChat.type === 'group') {
      unsubscribe = subscribeToGroupMessages(activeChat.id, (fetchedMessages) => {
        setMessages(fetchedMessages);
      });
    } else if (activeChat.type === 'private') {
      unsubscribe = subscribeToPrivateMessages(currentUser.uid, activeChat.id, (fetchedMessages) => {
        setMessages(fetchedMessages);
      });
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [activeChat, currentUser]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;

    const textToSend = newMessage.trim();
    setNewMessage(''); // optimistic clear

    try {
      if (activeChat.type === 'group') {
        await sendGroupMessage(activeChat.id, currentUser.uid, currentUser.displayName || currentUser.email, textToSend);
      } else {
        const targetUser = allUsers.find(u => u.id === activeChat.id);
        const targetName = targetUser?.displayName || 'Unknown User';
        await sendPrivateMessage(currentUser.uid, currentUser.displayName || currentUser.email, activeChat.id, targetName, textToSend);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // In a real app, you'd show a toast error here and restore the message text
    }
  };

  const getActiveChatName = () => {
    if (activeChat.type === 'group') {
      return `${activeChat.id} Group`;
    } else {
      const user = allUsers.find(u => u.id === activeChat.id);
      return user ? user.displayName : 'Loading User...';
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-4rem)] flex gap-6">
      
      {/* Sidebar */}
      <div className={`w-full md:w-80 flex-shrink-0 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden ${isChatOpenMobile ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <h2 className="font-bold text-slate-800 text-lg">Chats</h2>
        </div>
        
        <div className="overflow-y-auto flex-grow">
          {/* Group Chat */}
          <div className="p-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-3">Your Course Group</p>
            <button
              onClick={() => {
                setActiveChat({ type: 'group', id: currentUser.course || 'General' });
                setIsChatOpenMobile(true);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                activeChat.type === 'group' ? 'bg-green-50 border border-green-100' : 'hover:bg-slate-50 border border-transparent'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="text-left flex-grow truncate">
                <p className={`font-semibold truncate ${activeChat.type === 'group' ? 'text-green-800' : 'text-slate-700'}`}>
                  {currentUser.course || 'General Alumni'}
                </p>
                <p className="text-xs text-slate-500 truncate">Course Group Chat</p>
              </div>
            </button>
          </div>

          <div className="px-6 py-2">
            <div className="border-t border-slate-100"></div>
          </div>

          {/* Direct Messages */}
          <div className="p-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-3">Alumni (Direct Messages)</p>
            <div className="space-y-1">
              {allUsers.map(user => (
                <button
                  key={user.id}
                  onClick={() => {
                    setActiveChat({ type: 'private', id: user.id });
                    setIsChatOpenMobile(true);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    activeChat.type === 'private' && activeChat.id === user.id ? 'bg-green-50 border border-green-100' : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="text-left flex-grow truncate">
                    <p className={`font-semibold truncate ${activeChat.type === 'private' && activeChat.id === user.id ? 'text-green-800' : 'text-slate-700'}`}>
                      {user.displayName || 'Alumni'}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{user.course}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-grow bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden ${isChatOpenMobile ? 'flex' : 'hidden md:flex'}`}>
        
        {/* Chat Header */}
        <div className="h-16 px-6 border-b border-slate-100 flex items-center bg-slate-50 shadow-sm z-10 shrink-0">
          <div className="flex items-center gap-3">
            {isChatOpenMobile && (
              <button 
                onClick={() => setIsChatOpenMobile(false)}
                className="md:hidden p-1 mr-2 text-slate-500 hover:text-slate-700 transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
            )}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activeChat.type === 'group' ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-600'}`}>
              {activeChat.type === 'group' ? <Users className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="font-bold text-slate-800">{getActiveChatName()}</h2>
              <p className="text-xs text-slate-500">
                {activeChat.type === 'group' ? 'Public Group Chat' : 'Private Message'}
              </p>
            </div>
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-grow overflow-y-auto p-6 bg-slate-50/50 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
              <p>No messages yet. Say hello!</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isMine = msg.senderId === currentUser.uid;
              return (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={msg.id || index} 
                  className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] ${isMine ? 'order-1' : 'order-2'}`}>
                    {/* Show sender name for group chats if it's not me */}
                    {!isMine && activeChat.type === 'group' && (
                      <span className="text-xs text-slate-500 ml-1 mb-1 block">
                        {msg.senderName || 'Unknown User'}
                      </span>
                    )}
                    <div className="flex flex-col items-end">
                      <div 
                        className={`px-5 py-3 rounded-2xl ${
                          isMine 
                            ? 'bg-green-600 text-white rounded-br-sm shadow-sm' 
                            : 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm shadow-sm'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      </div>
                      {msg.createdAt && (
                        <span className="text-[10px] text-slate-400 mt-1 mr-1 block">
                          {formatTime(msg.createdAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 bg-white border-t border-slate-100 shrink-0">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-grow px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
            />
            <button 
              type="submit"
              disabled={!newMessage.trim()}
              className="px-5 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:hover:bg-green-600 shadow-sm flex items-center justify-center shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
