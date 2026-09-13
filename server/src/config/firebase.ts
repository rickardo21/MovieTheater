import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth as adminGetAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

let serviceAccountPath = path.resolve(process.cwd(), 'serviceAccount.json');
if (!fs.existsSync(serviceAccountPath)) {
    serviceAccountPath = path.resolve(process.cwd(), 'serviceAccountKey.json');
}

export const initFirebase = () => {
    if (getApps().length > 0) return;

    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        try {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            initializeApp({ credential: cert(serviceAccount) });
            console.log('✅ [Firebase] Admin SDK inizializzato tramite env FIREBASE_SERVICE_ACCOUNT');
            return;
        } catch (e) {
            console.error('❌ Errore parsing FIREBASE_SERVICE_ACCOUNT env:', e);
        }
    }

    if (fs.existsSync(serviceAccountPath)) {
        try {
            const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));
            initializeApp({ credential: cert(serviceAccount) });
            console.log('✅ [Firebase] Admin SDK inizializzato tramite file serviceAccount');
            return;
        } catch (error) {
            console.error('❌ [Firebase] Errore inizializzazione da file:', error);
            return;
        }
    }

    console.warn('⚠️  [Firebase] serviceAccountKey.json non trovato.');
    console.warn('Scarica il file dalle impostazioni del progetto Firebase e inseriscilo nella cartella server/.');
};

export const getAuth = () => adminGetAuth();
export const getDb = () => getFirestore();
