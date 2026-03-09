import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, orderBy, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import API_URL from '../config';

const ChatPage = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const targetUserId = searchParams.get('userId');

    const [conversations, setConversations] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [userProfiles, setUserProfiles] = useState({});
    const [sending, setSending] = useState(false);
    const [error, setError] = useState(null);
    const [replyingTo, setReplyingTo] = useState(null);
    const [hoveredMsgId, setHoveredMsgId] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    const messagesContainerRef = useRef(null); // ref on the scrollable div
    const prevMessageCountRef = useRef(0);
    const startedRef = useRef(false);
    const inputRef = useRef(null);

    // ── Track mobile breakpoint ──────────────────────────────────────────────
    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    // ── Scroll messages container (NOT the whole page) ───────────────────────
    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container || messages.length === 0) return;

        // Only scroll if message count increased (new message), not on every render
        if (messages.length > prevMessageCountRef.current) {
            const isInitialLoad = prevMessageCountRef.current === 0;
            container.scrollTop = container.scrollHeight;
            if (!isInitialLoad) {
                // smooth scroll for new messages after initial load
                container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
            }
        }
        prevMessageCountRef.current = messages.length;
    }, [messages]);

    // ── Fetch user profile ───────────────────────────────────────────────────
    const fetchUserProfile = useCallback(async (userId) => {
        if (!userId || userProfiles[userId]) return;
        try {
            const res = await fetch(`${API_URL}/users/${userId}`);
            if (res.ok) {
                const data = await res.json();
                setUserProfiles(prev => ({ ...prev, [userId]: data }));
            }
        } catch (e) {
            console.error('Could not fetch profile for', userId);
        }
    }, [userProfiles]);

    // ── Conversations listener ───────────────────────────────────────────────
    useEffect(() => {
        if (!user) return;
        const userId = user.dbId || user.uid;

        const q = query(
            collection(db, 'conversations'),
            where('users', 'array-contains', userId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = [];
            snapshot.forEach(docSnap => list.push({ id: docSnap.id, ...docSnap.data() }));
            list.sort((a, b) => {
                const timeA = a.last_message_at?.seconds || 0;
                const timeB = b.last_message_at?.seconds || 0;
                return timeB - timeA;
            });
            setConversations(list);
            setLoading(false);

            const myId = user.dbId || user.uid;
            list.forEach(c => {
                const otherId = c.users?.find(p => p !== myId);
                if (otherId) fetchUserProfile(otherId);
            });
        }, (err) => {
            console.error('Firestore error:', err);
            setError('Could not load conversations. Check Firestore security rules.');
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    // ── Start chat from Profile link ─────────────────────────────────────────
    useEffect(() => {
        if (!targetUserId || !user || loading || startedRef.current) return;

        const existing = conversations.find(c => c.users?.includes(targetUserId));
        if (existing) {
            setActiveChat(existing);
            startedRef.current = true;
        } else {
            startedRef.current = true;
            startNewChat(targetUserId);
        }
    }, [targetUserId, conversations, user, loading]);

    const startNewChat = async (targetId) => {
        try {
            setError(null);
            const currentUserId = user.dbId || user.uid;
            const res = await fetch(`${API_URL}/chat/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user1Id: currentUserId, user2Id: targetId })
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Could not start conversation.');
                return;
            }
            setActiveChat(data);
            fetchUserProfile(targetId);
        } catch (err) {
            console.error('Error starting chat:', err);
            setError('Failed to start conversation. Please try again.');
        }
    };

    // ── Messages listener ────────────────────────────────────────────────────
    useEffect(() => {
        if (!activeChat?.id) return;
        prevMessageCountRef.current = 0;
        setReplyingTo(null);

        const q = query(
            collection(db, 'conversations', activeChat.id, 'messages'),
            orderBy('timestamp', 'asc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = [];
            snapshot.forEach(docSnap => msgs.push({ id: docSnap.id, ...docSnap.data() }));
            setMessages(msgs);
        }, (err) => {
            console.error('Message read error:', err);
            setError('Could not load messages. Firestore rules may need to be updated.');
        });

        return () => unsubscribe();
    }, [activeChat?.id]);

    // ── Send message ─────────────────────────────────────────────────────────
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeChat || !user || sending) return;

        const text = newMessage.trim();
        const parentId = replyingTo?.id ?? null;

        setNewMessage('');
        setReplyingTo(null);
        setSending(true);
        setError(null);

        // Keep input focused after send (prevents mobile keyboard from hiding)
        inputRef.current?.focus();

        try {
            const senderId = user.dbId || user.uid;
            const receiverId = activeChat.users?.find(p => p !== senderId);

            const messageData = {
                sender_id: senderId,
                receiver_id: receiverId,
                message: text,
                status: 'sent',
                timestamp: serverTimestamp(),
                // Store a local client time so we can display immediately without "Sending..."
                client_time: Date.now(),
            };
            if (parentId) messageData.parent_message_id = parentId;

            await addDoc(collection(db, 'conversations', activeChat.id, 'messages'), messageData);

            await updateDoc(doc(db, 'conversations', activeChat.id), {
                last_message: text,
                last_message_at: serverTimestamp()
            });
        } catch (err) {
            console.error('Error sending message:', err);
            setError('Message failed to send. Please check Firestore security rules in Firebase Console.');
        } finally {
            setSending(false);
        }
    };

    // ── Reply helpers ────────────────────────────────────────────────────────
    const handleReply = (msg) => {
        setReplyingTo(msg);
        inputRef.current?.focus();
    };

    const cancelReply = () => setReplyingTo(null);

    const getParentMessage = (parentId) => messages.find(m => m.id === parentId) || null;

    // ── Name helpers ─────────────────────────────────────────────────────────
    const getPartnerName = (conv) => {
        const myId = user?.dbId || user?.uid;
        const otherId = conv.users?.find(p => p !== myId);
        return userProfiles[otherId]?.username || `User ${otherId?.slice(0, 6) || ''}...`;
    };

    const getPartnerInitial = (conv) => getPartnerName(conv)[0]?.toUpperCase() || '?';

    const getSenderName = (senderId) => {
        if (senderId === (user?.dbId || user?.uid)) return 'You';
        return userProfiles[senderId]?.username || `User ${senderId?.slice(0, 6) || ''}...`;
    };

    // ── Guard ────────────────────────────────────────────────────────────────
    if (!user) return (
        <div style={{ textAlign: 'center', padding: '100px', color: 'var(--text-muted)' }}>
            <p>Please <Link to="/login" style={{ color: 'var(--secondary)' }}>sign in</Link> to access messages.</p>
        </div>
    );

    // Mobile: show sidebar ONLY when no active chat, show chat ONLY when active chat selected
    const showSidebar = !isMobile || !activeChat;
    const showChat = !isMobile || !!activeChat;

    return (
        <div style={{
            display: 'flex',
            height: isMobile ? 'calc(100svh - 80px)' : 'calc(100vh - 160px)',
            gap: isMobile ? 0 : '24px',
            position: 'relative',
            overflow: 'hidden'
        }}>

            {/* ── Conversations Sidebar ────────────────────────────────────── */}
            {showSidebar && (
                <div className="glass-effect" style={{
                    width: isMobile ? '100%' : '320px',
                    flexShrink: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'var(--surface-1)',
                    overflow: 'hidden',
                }}>
                    <div style={{ padding: '20px 20px', borderBottom: '1px solid var(--glass-border)', flexShrink: 0 }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Conversations</h3>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
                        {loading && <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>Loading...</p>}
                        {!loading && conversations.length === 0 && (
                            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px', fontSize: '0.9rem' }}>No conversations yet.</p>
                        )}
                        {conversations.map(c => {
                            const isActive = activeChat?.id === c.id;
                            const partnerName = getPartnerName(c);
                            const initial = partnerName[0]?.toUpperCase() || '?';
                            return (
                                <div
                                    key={c.id}
                                    onClick={() => setActiveChat(c)}
                                    style={{
                                        padding: '14px 16px',
                                        borderRadius: 'var(--radius-md)',
                                        cursor: 'pointer',
                                        background: isActive ? 'var(--surface-2)' : 'transparent',
                                        border: isActive ? '1px solid var(--glass-border)' : '1px solid transparent',
                                        marginBottom: '4px',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px'
                                    }}
                                    onMouseOver={(e) => !isActive && (e.currentTarget.style.background = 'var(--surface-2)')}
                                    onMouseOut={(e) => !isActive && (e.currentTarget.style.background = 'transparent')}
                                >
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--secondary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0, fontSize: '1rem' }}>
                                        {initial}
                                    </div>
                                    <div style={{ flex: 1, overflow: 'hidden' }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary)', marginBottom: '2px' }}>{partnerName}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {c.last_message || 'Start a conversation'}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── Chat Window ──────────────────────────────────────────────── */}
            {showChat && (
                <div className="glass-effect" style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'var(--surface-1)',
                    overflow: 'hidden',
                    minWidth: 0,
                }}>

                    {error && (
                        <div style={{ padding: '10px 20px', background: '#fee2e2', color: '#dc2626', fontSize: '0.8rem', fontWeight: 600, borderBottom: '1px solid #fca5a5', flexShrink: 0 }}>
                            ⚠️ {error}
                        </div>
                    )}

                    {activeChat ? (
                        <>
                            {/* Header */}
                            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                                {/* Mobile back button */}
                                {isMobile && (
                                    <button
                                        onClick={() => setActiveChat(null)}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: 'var(--secondary)',
                                            fontWeight: 700,
                                            fontSize: '0.9rem',
                                            cursor: 'pointer',
                                            padding: '4px 8px 4px 0',
                                            flexShrink: 0
                                        }}
                                    >
                                        ← Back
                                    </button>
                                )}
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--secondary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
                                    {getPartnerInitial(activeChat)}
                                </div>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>{getPartnerName(activeChat)}</h4>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Active now</span>
                                </div>
                            </div>

                            {/* Messages — scroll container */}
                            <div
                                ref={messagesContainerRef}
                                style={{
                                    flex: 1,
                                    overflowY: 'auto',
                                    padding: isMobile ? '16px' : '24px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '8px',
                                    // Prevent mobile bounce scroll from moving the page
                                    overscrollBehavior: 'contain',
                                }}
                            >
                                {messages.map((m) => {
                                    const isMe = m.sender_id === (user.dbId || user.uid);

                                    // Use server timestamp if available, fall back to client_time, then null
                                    const tsMillis = m.timestamp?.toMillis?.()
                                        ?? (m.timestamp?.seconds ? m.timestamp.seconds * 1000 : null)
                                        ?? m.client_time
                                        ?? null;

                                    const timeDisplay = tsMillis
                                        ? new Date(tsMillis).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                        : '...';

                                    const parentMsg = m.parent_message_id ? getParentMessage(m.parent_message_id) : null;

                                    return (
                                        <div
                                            key={m.id}
                                            style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: isMobile ? '85%' : '70%' }}
                                            onMouseEnter={() => setHoveredMsgId(m.id)}
                                            onMouseLeave={() => setHoveredMsgId(null)}
                                        >
                                            {/* Reply-to quote block */}
                                            {parentMsg && (
                                                <div style={{
                                                    marginBottom: '4px',
                                                    padding: '6px 12px',
                                                    borderRadius: '10px',
                                                    background: 'var(--surface-2)',
                                                    fontSize: '0.75rem',
                                                    color: 'var(--text-muted)',
                                                    maxWidth: '100%',
                                                    overflow: 'hidden',
                                                    textAlign: isMe ? 'right' : 'left',
                                                    borderRight: isMe ? '3px solid var(--secondary)' : 'none',
                                                    borderLeft: isMe ? 'none' : '3px solid var(--secondary)',
                                                }}>
                                                    <span style={{ fontWeight: 700, color: 'var(--secondary)', marginRight: '4px' }}>
                                                        ↳ {getSenderName(parentMsg.sender_id)}:
                                                    </span>
                                                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'inline-block', maxWidth: '160px', verticalAlign: 'bottom' }}>
                                                        {parentMsg.message}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Bubble row */}
                                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', flexDirection: isMe ? 'row-reverse' : 'row' }}>
                                                {/* Reply button — shown on hover/tap */}
                                                {!isMobile && (
                                                    <button
                                                        onClick={() => handleReply(m)}
                                                        title="Reply"
                                                        style={{
                                                            opacity: hoveredMsgId === m.id ? 1 : 0,
                                                            transition: 'opacity 0.15s',
                                                            background: 'var(--surface-2)',
                                                            border: '1px solid var(--glass-border)',
                                                            borderRadius: '50%',
                                                            width: '28px',
                                                            height: '28px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            cursor: 'pointer',
                                                            color: 'var(--text-muted)',
                                                            fontSize: '0.75rem',
                                                            flexShrink: 0,
                                                            padding: 0,
                                                        }}
                                                    >
                                                        ↩
                                                    </button>
                                                )}

                                                {/* Message bubble */}
                                                <div
                                                    style={{
                                                        padding: isMobile ? '10px 14px' : '12px 18px',
                                                        borderRadius: isMe ? '20px 20px 2px 20px' : '20px 20px 20px 2px',
                                                        background: isMe ? 'var(--secondary)' : 'var(--surface-2)',
                                                        color: isMe ? 'white' : 'var(--text-primary)',
                                                        fontSize: isMobile ? '0.9rem' : '0.95rem',
                                                        fontWeight: 500,
                                                        boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                                                        wordBreak: 'break-word',
                                                    }}
                                                    // On mobile, tap to reply
                                                    onDoubleClick={() => isMobile && handleReply(m)}
                                                >
                                                    {m.message}
                                                </div>
                                            </div>

                                            {/* Timestamp */}
                                            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '3px', textAlign: isMe ? 'right' : 'left', fontWeight: 600 }}>
                                                {timeDisplay}
                                                {isMe && m.status && tsMillis && (
                                                    <span style={{ marginLeft: '4px', opacity: 0.7 }}>
                                                        {m.status === 'read' ? '✓✓' : m.status === 'delivered' ? '✓✓' : '✓'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Input area */}
                            <div style={{ borderTop: '1px solid var(--glass-border)', flexShrink: 0 }}>

                                {/* Reply bar */}
                                {replyingTo && (
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '8px 16px',
                                        background: 'var(--surface-2)',
                                        gap: '10px',
                                        borderBottom: '1px solid var(--glass-border)',
                                    }}>
                                        <div style={{ flex: 1, overflow: 'hidden' }}>
                                            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--secondary)', marginBottom: '2px' }}>
                                                Replying to {getSenderName(replyingTo.sender_id)}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {replyingTo.message}
                                            </div>
                                        </div>
                                        <button
                                            onClick={cancelReply}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.1rem', padding: '2px 6px', borderRadius: '50%', lineHeight: 1 }}
                                            title="Cancel reply"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                )}

                                <form
                                    onSubmit={handleSendMessage}
                                    style={{ padding: isMobile ? '12px 16px' : '16px 24px', display: 'flex', gap: '10px' }}
                                >
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        placeholder={replyingTo ? `Reply to ${getSenderName(replyingTo.sender_id)}...` : 'Type a message...'}
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        // Prevent iOS from auto-scrolling the page on focus
                                        onFocus={() => {
                                            setTimeout(() => {
                                                const container = messagesContainerRef.current;
                                                if (container) container.scrollTop = container.scrollHeight;
                                            }, 300);
                                        }}
                                        style={{
                                            flex: 1,
                                            padding: isMobile ? '12px 16px' : '14px 20px',
                                            borderRadius: '100px',
                                            border: '1px solid var(--glass-border)',
                                            background: 'var(--surface-2)',
                                            outline: 'none',
                                            fontSize: '0.95rem',
                                            color: 'var(--text-primary)',
                                            minWidth: 0,
                                        }}
                                    />
                                    <button
                                        className="btn-premium"
                                        type="submit"
                                        style={{
                                            padding: isMobile ? '0 16px' : '0 24px',
                                            borderRadius: '100px',
                                            opacity: sending ? 0.6 : 1,
                                            flexShrink: 0,
                                            fontSize: isMobile ? '0.8rem' : '0.9rem',
                                        }}
                                        disabled={!newMessage.trim() || sending}
                                    >
                                        {sending ? '...' : 'SEND'}
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexDirection: 'column', gap: '16px' }}>
                            <i className="fas fa-comments" style={{ fontSize: '3rem', opacity: 0.2 }}></i>
                            <p style={{ fontWeight: 600 }}>Select a conversation to start deliberations.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ChatPage;
