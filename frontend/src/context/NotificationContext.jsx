import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import API_URL from '../config';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const markAsRead = async (notificationId) => {
        try {
            const response = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
                method: 'PATCH'
            });
            if (response.ok) {
                // Local state will be updated by onSnapshot eventually, 
                // but we can update it immediately for responsiveness
                setNotifications(prev => prev.map(n => 
                    n.id === notificationId ? { ...n, isRead: true } : n
                ));
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        if (!user) return;
        const userId = user.dbId || user.uid;
        try {
            const response = await fetch(`${API_URL}/notifications/read-all/${userId}`, {
                method: 'PATCH'
            });
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    useEffect(() => {
        if (user) {
            const userId = user.dbId || user.uid;
            console.log(`[NOTIF REALTIME] Subscribing for user: ${userId}`);
            
            const q = query(
                collection(db, 'notifications'), 
                where('recipientId', '==', userId)
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const notifs = [];
                snapshot.forEach((doc) => {
                    notifs.push({ id: doc.id, ...doc.data() });
                });
                
                // Sort by date DESC
                notifs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                console.log(`[NOTIF REALTIME] Received ${notifs.length} notifications`);
                setNotifications(notifs);
                setUnreadCount(notifs.filter(n => !n.isRead).length);
            }, (error) => {
                console.error('Real-time notifications error:', error);
            });

            return () => unsubscribe();
        } else {
            setNotifications([]);
            setUnreadCount(0);
        }
    }, [user]);

    const value = {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};
