import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { FiSearch, FiSend, FiUsers, FiUser } from 'react-icons/fi';
// import './ManagerChat.css';

// Singleton Socket.IO instance
const socket = io('http://localhost:5000', {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
});

const ManagerChat = ({ userId }) => {
  const [societyId, setSocietyId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('resident'); // 'resident' or 'staff'
  const [searchResults, setSearchResults] = useState([]);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState({});
  const [messageInput, setMessageInput] = useState('');
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    const init = async () => {
      try {
        const storedSocietyId = localStorage.getItem('societyId');
        const token = localStorage.getItem('token');
        if (userId && storedSocietyId && token) {
          setSocietyId(storedSocietyId);
          socket.emit('join', userId);

          // Fetch existing chats
          const chatsResponse = await fetch(`http://localhost:5000/api/chat/user/${userId}`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
          if (!chatsResponse.ok) {
            const errorData = await chatsResponse.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! Status: ${chatsResponse.status}`);
          }
          const chatsData = await chatsResponse.json();
          if (isMounted.current) {
            setChats(chatsData.map(chat => ({ ...chat, chatId: chat._id })));
          }
        } else {
          if (isMounted.current) {
            setError('Missing user ID, society ID, or token. Please log in again.');
            setTimeout(() => {
              window.location.href = '/login';
            }, 3000);
          }
        }
      } catch (err) {
        if (isMounted.current) {
          setError(`Failed to initialize chat: ${err.message}`);
          console.error('Init error:', err.message);
        }
      }
    };
    init();

    socket.on('connect', () => {
      console.log('Socket.IO connected:', socket.id);
      if (isMounted.current) {
        setError(''); // Clear connection error
        if (userId) socket.emit('join', userId);
      }
    });

    socket.on('connect_error', (err) => {
      console.error('Socket.IO connect_error:', err.message);
      if (isMounted.current) {
        setError('Failed to connect to chat server. Retrying...');
      }
    });

    socket.on('newMessage', ({ chatId, senderId, content, timestamp, status, messageId }) => {
      if (isMounted.current) {
        setMessages(prev => {
          const chatMessages = [...(prev[chatId] || [])];
          const messageExists = chatMessages.some(msg => msg.messageId === messageId);
          if (!messageExists) {
            chatMessages.push({ senderId, content, timestamp, status, messageId });
          }
          return { ...prev, [chatId]: chatMessages };
        });
        setChats(prev => {
          const chatIndex = prev.findIndex(chat => chat.chatId === chatId);
          if (chatIndex !== -1) {
            const updatedChats = [...prev];
            updatedChats[chatIndex] = { ...updatedChats[chatIndex], lastMessage: { content, timestamp } };
            return updatedChats;
          }
          return prev;
        });
        if (selectedChat?.chatId === chatId) {
          scrollToBottom();
        }
      }
    });

    socket.on('messageDelivered', ({ chatId, messageId }) => {
      if (isMounted.current) {
        setMessages(prev => {
          const chatMessages = [...(prev[chatId] || [])];
          const updatedMessages = chatMessages.map(msg =>
            msg.messageId === messageId ? { ...msg, status: 'delivered' } : msg
          );
          return { ...prev, [chatId]: updatedMessages };
        });
      }
    });

    return () => {
      isMounted.current = false;
      socket.off('connect');
      socket.off('connect_error');
      socket.off('newMessage');
      socket.off('messageDelivered');
    };
  }, [userId, selectedChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/chat/search?query=${encodeURIComponent(searchQuery)}&societyId=${societyId}&userType=${searchType}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      if (isMounted.current) {
        setSearchResults(data);
      }
    } catch (err) {
      console.error('Search error:', err.message);
      if (isMounted.current) {
        setError(`Failed to search users: ${err.message}`);
      }
    }
  };

  const startChat = async (user) => {
    try {
      const token = localStorage.getItem('token');
      // Check if chat already exists
      let chat = chats.find(c => c.participants.some(p => p._id === user._id && p._id !== userId));
      if (!chat) {
        // Create new chat
        const response = await fetch('http://localhost:5000/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            participants: [userId, user._id],
            isGroup: false,
          }),
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        chat = { ...data, chatId: data._id };
        if (isMounted.current) {
          setChats(prev => [...prev, chat]);
        }
      }
      await selectChat(chat);
      if (isMounted.current) {
        setSearchQuery('');
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Start chat error:', err.message);
      if (isMounted.current) {
        setError(`Failed to start chat: ${err.message}`);
      }
    }
  };

  const selectChat = async (chat) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/chat/messages/${chat.chatId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }
      const messagesData = await response.json();
      if (isMounted.current) {
        setMessages(prev => ({
          ...prev,
          [chat.chatId]: messagesData.map(msg => ({
            senderId: msg.sender._id,
            content: msg.content,
            timestamp: msg.timestamp,
            status: msg.status,
            messageId: msg._id,
          })),
        }));
        setSelectedChat(chat);
        scrollToBottom();
      }
    } catch (err) {
      console.error('Fetch messages error:', err.message);
      if (isMounted.current) {
        setError(`Failed to fetch messages: ${err.message}`);
      }
    }
  };

  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedChat) return;
    try {
      const tempMessageId = `temp-${Date.now()}`;
      const newMessage = {
        chatId: selectedChat.chatId,
        senderId: userId,
        content: messageInput,
        timestamp: new Date().toISOString(),
        status: 'sent',
        messageId: tempMessageId,
      };
      if (isMounted.current) {
        setMessages(prev => ({
          ...prev,
          [selectedChat.chatId]: [...(prev[selectedChat.chatId] || []), newMessage],
        }));
      }
      socket.emit('sendMessage', {
        chatId: selectedChat.chatId,
        senderId: userId,
        content: messageInput,
      }, (response) => {
        if (isMounted.current) {
          if (response.error) {
            setError(`Failed to send message: ${response.error}`);
          } else {
            setMessages(prev => {
              const chatMessages = [...(prev[selectedChat.chatId] || [])];
              const updatedMessages = chatMessages.map(msg =>
                msg.messageId === tempMessageId ? { ...msg, messageId: response.messageId } : msg
              );
              return { ...prev, [selectedChat.chatId]: updatedMessages };
            });
          }
        }
      });
      if (isMounted.current) {
        setMessageInput('');
        scrollToBottom();
      }
    } catch (err) {
      console.error('Send message error:', err.message);
      if (isMounted.current) {
        setError(`Failed to send message: ${err.message}`);
      }
    }
  };

  const getChatName = (chat) => {
    const otherParticipant = chat.participants.find(p => p._id !== userId);
    return otherParticipant?.name || 'Unknown';
  };

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="chat-container">
      {/* Left Panel: Chat List and Search */}
      <div className="left-panel">
        <div className="chat-header">
          <h2>Chats</h2>
        </div>
        <div className="search-toggle">
          <button
            className={`toggle-button ${searchType === 'resident' ? 'active' : ''}`}
            onClick={() => setSearchType('resident')}
          >
            <FiUsers className="icon" /> Residents
          </button>
          <button
            className={`toggle-button ${searchType === 'staff' ? 'active' : ''}`}
            onClick={() => setSearchType('staff')}
          >
            <FiUser className="icon" /> Staff
          </button>
        </div>
        <div className="search-container">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder={`Search ${searchType === 'resident' ? 'verified residents' : 'staff'} by phone`}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              searchUsers();
            }}
            className="search-input"
          />
        </div>
        {searchResults.length > 0 && (
          <div className="search-results">
            {searchResults.map(user => (
              <div
                key={user._id}
                className="search-result-item"
                onClick={() => startChat(user)}
              >
                <div className="avatar">{user.name[0]}</div>
                <div>
                  <p className="user-name">{user.name}</p>
                  <p className="user-phone">{user.phoneNumber}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="chat-list">
          {chats.map(chat => (
            <div
              key={chat.chatId}
              className={`chat-item ${selectedChat?.chatId === chat.chatId ? 'selected' : ''}`}
              onClick={() => selectChat(chat)}
            >
              <div className="avatar">{getChatName(chat)[0]}</div>
              <div className="chat-info">
                <p className="chat-name">{getChatName(chat)}</p>
                <p className="chat-preview">{chat.lastMessage?.content || 'No messages yet'}</p>
              </div>
              <p className="chat-time">
                {chat.lastMessage && new Date(chat.lastMessage.timestamp).toLocaleTimeString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel: Chat Messages */}
      <div className="right-panel">
        {selectedChat ? (
          <>
            <div className="chat-header">
              <div className="avatar">{getChatName(selectedChat)[0]}</div>
              <h2>{getChatName(selectedChat)}</h2>
            </div>
            <div className="messages-container">
              {(messages[selectedChat.chatId] || []).map(msg => (
                <div
                  key={msg.messageId}
                  className={`message ${msg.senderId === userId ? 'sent' : 'received'}`}
                >
                  <p>{msg.content}</p>
                  <p className="message-meta">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                    {msg.senderId === userId && msg.status === 'delivered' && ' ✓✓'}
                  </p>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="message-input-container">
              <input
                type="text"
                placeholder="Type a message"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                className="message-input"
              />
              <button
                onClick={sendMessage}
                className="send-button"
                disabled={!messageInput.trim()}
              >
                <FiSend />
              </button>
            </div>
          </>
        ) : (
          <div className="no-chat">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerChat;