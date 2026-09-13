import { Router } from "express";
import { getMasterPlaylistForContent, chooseBestVideoQuality } from "../services/vixsrc";

export const vixsrcRouter = Router();

// Film: restituisce tutta la master playlist già parsata
vixsrcRouter.get("/movie/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const result = await getMasterPlaylistForContent("movie", id);

        res.json({
            embedUrl: result.embedUrl,
            masterUrl: result.masterUrl,
            parsed: result.parsed,
            best1080: chooseBestVideoQuality(result.parsed.video_qualities, 1080),
        });
    } catch (e) {
        res
            .status(500)
            .json({ error: e instanceof Error ? e.message : "Unknown error" });
    }
});

// Serie TV: episodio specifico
vixsrcRouter.get("/tv/:id/:season/:episode", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const season = Number(req.params.season);
        const episode = Number(req.params.episode);

        const result = await getMasterPlaylistForContent("tv", id, season, episode);

        res.json({
            embedUrl: result.embedUrl,
            masterUrl: result.masterUrl,
            parsed: result.parsed,
            best1080: chooseBestVideoQuality(result.parsed.video_qualities, 1080),
        });
    } catch (e) {
        res
            .status(500)
            .json({ error: e instanceof Error ? e.message : "Unknown error" });
    }
});