import { Request, Response, NextFunction } from 'express';
import { getAuth } from '../config/firebase.js';

export interface AuthRequest extends Request {
    user?: any; // Token decodificato
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token di autenticazione mancante o formato non valido' });
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await getAuth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error('Errore validazione token Firebase:', error);
        return res.status(403).json({ error: 'Token non valido o scaduto' });
    }
};
