import { Router, Response } from "express";
import { getAuth } from "../config/firebase.js";
import crypto from "crypto";
import { requireAuth, AuthRequest } from "../middleware/auth.js";

export const authRouter = Router();

// In-memory store per i codici dispositivo. 
// In produzione (con più server) andrebbe usato Redis o Firestore.
const deviceCodes = new Map<string, { status: string; customToken?: string; expiresAt: number }>();

// 1. Genera un nuovo codice dispositivo (chiamato dalla TV)
authRouter.post("/device/code", (req, res) => {
    const code = crypto.randomBytes(3).toString("hex").toUpperCase();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minuti di validità

    deviceCodes.set(code, { status: "pending", expiresAt });

    res.json({ code, expiresAt });
});

// 2. Polling dello stato del codice (chiamato dalla TV)
authRouter.get("/device/poll/:code", (req, res: any) => {
    const { code } = req.params;
    const session = deviceCodes.get(code.toUpperCase());

    if (!session) {
        return res.status(404).json({ error: "Codice non trovato o scaduto" });
    }

    if (Date.now() > session.expiresAt) {
        deviceCodes.delete(code.toUpperCase());
        return res.status(400).json({ error: "Codice scaduto" });
    }

    if (session.status === "authorized" && session.customToken) {
        const token = session.customToken;
        deviceCodes.delete(code.toUpperCase());
        return res.json({ status: "authorized", customToken: token });
    }

    res.json({ status: "pending" });
});

// 3. Autorizza il codice (chiamato dallo smartphone, richiede login)
authRouter.post("/device/authorize", requireAuth, async (req: AuthRequest, res: any) => {
    const { code } = req.body;
    const uid = req.user?.uid;

    if (!code || !uid) {
        return res.status(400).json({ error: "Codice o utente mancante" });
    }

    const session = deviceCodes.get(code.toUpperCase());
    if (!session) {
        return res.status(404).json({ error: "Codice non valido o scaduto" });
    }

    if (Date.now() > session.expiresAt) {
        deviceCodes.delete(code.toUpperCase());
        return res.status(400).json({ error: "Codice scaduto" });
    }

    try {
        // Genera un custom token per la TV
        const customToken = await getAuth().createCustomToken(uid);
        
        session.status = "authorized";
        session.customToken = customToken;
        deviceCodes.set(code.toUpperCase(), session);

        res.json({ success: true });
    } catch (error) {
        console.error("Errore generazione custom token:", error);
        res.status(500).json({ error: "Errore interno" });
    }
});
