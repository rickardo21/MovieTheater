import { Router } from "express";
import { requireAuth, AuthRequest } from "../middleware/auth.js";
import { getDb } from "../config/firebase.js";

export const userRouter = Router();

// Crea o aggiorna il profilo utente. Chiamato dal frontend dopo il login/registrazione.
userRouter.post("/profile", requireAuth, async (req: AuthRequest, res: any) => {
    const uid = req.user?.uid;
    const { email, displayName, photoURL } = req.body;

    if (!uid) {
        return res.status(401).json({ error: "Utente non autorizzato" });
    }

    try {
        const userRef = getDb().collection("users").doc(uid);
        const doc = await userRef.get();

        if (!doc.exists) {
            // Crea profilo di base
            await userRef.set({
                uid,
                email: email || null,
                displayName: displayName || null,
                photoURL: photoURL || null,
                settings: {
                    language: "it",
                    theme: "dark",
                    quality: "auto",
                    autoplay: true
                },
                createdAt: new Date().toISOString()
            });
            return res.json({ success: true, message: "Profilo creato", isNewUser: true });
        } else {
            // Aggiorna info base (es. se cambia foto)
            await userRef.update({
                email: email || doc.data()?.email,
                displayName: displayName || doc.data()?.displayName,
                photoURL: photoURL || doc.data()?.photoURL,
                lastLoginAt: new Date().toISOString()
            });
            return res.json({ success: true, message: "Profilo aggiornato", isNewUser: false });
        }
    } catch (error) {
        console.error("Errore gestione profilo:", error);
        res.status(500).json({ error: "Errore interno server" });
    }
});

// Recupera il profilo utente
userRouter.get("/profile", requireAuth, async (req: AuthRequest, res: any) => {
    const uid = req.user?.uid;

    if (!uid) {
        return res.status(401).json({ error: "Utente non autorizzato" });
    }

    try {
        const doc = await getDb().collection("users").doc(uid).get();
        if (!doc.exists) {
            return res.status(404).json({ error: "Profilo non trovato" });
        }
        res.json(doc.data());
    } catch (error) {
        console.error("Errore fetch profilo:", error);
        res.status(500).json({ error: "Errore interno server" });
    }
});
