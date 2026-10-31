import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth as adminGetAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const requiredEnv = ['FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY'] as const;

export const initFirebase = () => {
    if (getApps().length > 0) return;

    const missing = requiredEnv.filter((name) => !process.env[name]);
    if (missing.length > 0) {
        throw new Error(
            `[Firebase] Variabili mancanti nel .env: ${missing.join(', ')}. Vedi server/.env.example.`
        );
    }

    initializeApp({
        credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            // Nel .env la chiave va su una riga con \n al posto degli a capo
            privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
        }),
    });
    console.log('✅ [Firebase] Admin SDK inizializzato tramite variabili .env');
};

export const getAuth = () => adminGetAuth();
export const getDb = () => getFirestore();
