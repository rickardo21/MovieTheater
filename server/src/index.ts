import "dotenv/config";
import express from "express";
import cors from "cors";
import { tmdbRouter } from "./routes/tmdb.js";
import { vixsrcRouter } from "./routes/vixsrc.js";
import { authRouter } from "./routes/auth.js";
import { userRouter } from "./routes/user.js";
import { initFirebase } from "./config/firebase.js";

// Inizializza Firebase Admin
initFirebase();

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

// CORS: accetta il tuo frontend in dev e in prod
app.use(
    cors({
        origin: [
            "http://localhost:5173",
            "http://localhost:3000",
            "http://192.168.1.114:5173",
            "https://tuodominio.com", // sostituisci con il tuo dominio in produzione
            /^https:\/\/[a-z0-9-]+\.vercel\.app$/, // deploy della PWA su Vercel (ogni deploy ha un indirizzo diverso)
        ],
    })
);

// Health check
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

// Route TMDB
app.use("/api/tmdb", tmdbRouter);

// Route VixSrc
app.use("/api/vixsrc", vixsrcRouter);

// Route Auth & User
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: "Not found" });
});

// Error handler globale
app.use((err: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Unhandled error:", err);
    res
        .status(500)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});