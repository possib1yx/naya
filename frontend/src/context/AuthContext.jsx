import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, onAuthStateChanged, signOut } from '../firebase';
import API_URL from '../config';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                // Sync with backend
                try {
                    const response = await fetch(`${API_URL}/auth/sync`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            uid: currentUser.uid,
                            email: currentUser.email,
                            displayName: currentUser.displayName
                        })
                    });
                    const dbUser = await response.json();
                    setUser({ ...currentUser, dbId: dbUser.id });
                } catch (error) {
                    console.error('Auth Sync Error:', error);
                    setUser(currentUser);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const logout = () => {
        return signOut(auth);
    };

    const value = {
        user,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
