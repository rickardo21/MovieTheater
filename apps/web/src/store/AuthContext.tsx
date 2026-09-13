import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
    type User, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut as firebaseSignOut, 
    onAuthStateChanged,
    signInWithCustomToken,
    updateProfile
} from 'firebase/auth';
import { 
    doc, 
    setDoc, 
    updateDoc, 
    onSnapshot, 
    collection, 
    deleteDoc 
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export interface UserSettings {
    language: string;
    theme: string;
    quality: string;
    autoplay: boolean;
}

export interface LibraryItem {
    id: string | number;
    type: 'movie' | 'tv';
    title?: string;
    bg?: string;
    logo?: string;
    addedAt?: string;
    overview?: string;
}

export interface WatchHistoryItem {
    id: string | number;
    type: 'movie' | 'tv';
    title?: string;
    bg?: string;
    logo?: string;
    progressSeconds: number;
    durationSeconds: number;
    updatedAt: string;
    season?: number;
    episode?: number;
    episodeTitle?: string;
}

export interface UserProfile {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    settings: UserSettings;
    createdAt?: string;
}

interface AuthContextType {
    user: User | null;
    userProfile: UserProfile | null;
    userSettings: UserSettings;
    library: LibraryItem[];
    watchHistory: WatchHistoryItem[];
    loading: boolean;
    login: (email: string, pass: string) => Promise<void>;
    register: (email: string, pass: string, name?: string) => Promise<void>;
    logout: () => Promise<void>;
    loginWithCustomToken: (token: string) => Promise<void>;
    updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
    addToLibrary: (item: any, type: 'movie' | 'tv') => Promise<void>;
    removeFromLibrary: (itemId: string | number) => Promise<void>;
    isInLibrary: (itemId: string | number) => boolean;
    saveWatchProgress: (item: any, type: 'movie' | 'tv', progressSeconds: number, durationSeconds: number, extraDetails?: any) => Promise<void>;
}

const DEFAULT_SETTINGS: UserSettings = {
    language: 'it',
    theme: 'dark',
    quality: 'auto',
    autoplay: true
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [userSettings, setUserSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
    const [library, setLibrary] = useState<LibraryItem[]>([]);
    const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // Track Auth state
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (!currentUser) {
                setUserProfile(null);
                setUserSettings(DEFAULT_SETTINGS);
                setLibrary([]);
                setWatchHistory([]);
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    // Sync user document, settings, library, watch history from Firestore
    useEffect(() => {
        if (!user) return;

        // 1. User doc & settings
        const userDocRef = doc(db, 'users', user.uid);
        const unsubProfile = onSnapshot(userDocRef, (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                setUserProfile({
                    uid: user.uid,
                    email: data.email || user.email,
                    displayName: data.displayName || user.displayName,
                    photoURL: data.photoURL || user.photoURL,
                    settings: data.settings || DEFAULT_SETTINGS
                });
                if (data.settings) {
                    setUserSettings(data.settings);
                }
            } else {
                // Initialize doc
                const initialProfile: UserProfile = {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                    settings: DEFAULT_SETTINGS,
                    createdAt: new Date().toISOString()
                };
                setDoc(userDocRef, initialProfile).catch((err) => console.error('Error creating profile doc:', err));
                setUserProfile(initialProfile);
            }
            setLoading(false);
        }, (err) => {
            console.error('Error fetching user profile:', err);
            setLoading(false);
        });

        // 2. Library collection
        const libraryColRef = collection(db, 'users', user.uid, 'library');
        const unsubLibrary = onSnapshot(libraryColRef, (snap) => {
            const items: LibraryItem[] = [];
            snap.forEach((docSnap) => {
                items.push(docSnap.data() as LibraryItem);
            });
            setLibrary(items);
        }, (err) => {
            console.error('Error fetching library:', err);
        });

        // 3. Watch History collection
        const historyColRef = collection(db, 'users', user.uid, 'watchHistory');
        const unsubHistory = onSnapshot(historyColRef, (snap) => {
            const items: WatchHistoryItem[] = [];
            snap.forEach((docSnap) => {
                items.push(docSnap.data() as WatchHistoryItem);
            });
            // Sort by updatedAt descending
            items.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
            setWatchHistory(items);
        }, (err) => {
            console.error('Error fetching watch history:', err);
        });

        return () => {
            unsubProfile();
            unsubLibrary();
            unsubHistory();
        };
    }, [user]);

    const login = async (email: string, pass: string) => {
        await signInWithEmailAndPassword(auth, email, pass);
    };

    const register = async (email: string, pass: string, name?: string) => {
        const cred = await createUserWithEmailAndPassword(auth, email, pass);
        if (name && cred.user) {
            await updateProfile(cred.user, { displayName: name });
        }
        if (cred.user) {
            const userDocRef = doc(db, 'users', cred.user.uid);
            await setDoc(userDocRef, {
                uid: cred.user.uid,
                email: cred.user.email,
                displayName: name || cred.user.displayName || null,
                photoURL: cred.user.photoURL || null,
                settings: DEFAULT_SETTINGS,
                createdAt: new Date().toISOString()
            });
        }
    };

    const logout = async () => {
        await firebaseSignOut(auth);
    };

    const loginWithCustomToken = async (token: string) => {
        await signInWithCustomToken(auth, token);
    };

    const updateSettings = async (newSettings: Partial<UserSettings>) => {
        const merged = { ...userSettings, ...newSettings };
        setUserSettings(merged);
        if (user) {
            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, { settings: merged }).catch(async () => {
                await setDoc(userDocRef, { settings: merged }, { merge: true });
            });
        }
    };

    const addToLibrary = async (item: any, type: 'movie' | 'tv') => {
        if (!user || !item || !item.id) return;
        const itemId = String(item.id);
        const itemDocRef = doc(db, 'users', user.uid, 'library', itemId);
        const libraryItem: LibraryItem = {
            id: item.id,
            type,
            title: item.title || item.name || '',
            bg: item.bg || item.backdrop_path || '',
            logo: item.logo || item.poster_path || '',
            overview: item.overview || '',
            addedAt: new Date().toISOString()
        };
        await setDoc(itemDocRef, libraryItem);
    };

    const removeFromLibrary = async (itemId: string | number) => {
        if (!user || !itemId) return;
        const itemDocRef = doc(db, 'users', user.uid, 'library', String(itemId));
        await deleteDoc(itemDocRef);
    };

    const isInLibrary = (itemId: string | number): boolean => {
        return library.some((item) => String(item.id) === String(itemId));
    };

    const saveWatchProgress = async (
        item: any,
        type: 'movie' | 'tv',
        progressSeconds: number,
        durationSeconds: number,
        extraDetails?: any
    ) => {
        if (!user || !item || !item.id) return;
        const itemId = String(item.id);
        const historyDocRef = doc(db, 'users', user.uid, 'watchHistory', itemId);
        
        const historyItem: WatchHistoryItem = {
            id: item.id,
            type,
            title: item.title || item.name || extraDetails?.title || '',
            bg: item.bg || item.backdropUrl || extraDetails?.bg || '',
            logo: item.logo || extraDetails?.logo || '',
            progressSeconds: Math.floor(progressSeconds),
            durationSeconds: Math.floor(durationSeconds),
            updatedAt: new Date().toISOString(),
            ...(extraDetails?.season ? { season: extraDetails.season } : {}),
            ...(extraDetails?.episode ? { episode: extraDetails.episode } : {}),
            ...(extraDetails?.episodeTitle ? { episodeTitle: extraDetails.episodeTitle } : {})
        };

        await setDoc(historyDocRef, historyItem, { merge: true });
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                userProfile,
                userSettings,
                library,
                watchHistory,
                loading,
                login,
                register,
                logout,
                loginWithCustomToken,
                updateSettings,
                addToLibrary,
                removeFromLibrary,
                isInLibrary,
                saveWatchProgress
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
