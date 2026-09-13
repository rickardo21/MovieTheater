import { Router } from "express";
import { tmdbService } from "../services/tmdb";

export const tmdbRouter = Router();

// Middleware to enable serverless Edge caching (CDN)
tmdbRouter.use((req, res, next) => {
    // Cache on Edge/CDN for 5 minutes, serve stale data while revalidating for another 1 minute
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60');
    next();
});

// ---------- MOVIES ----------

tmdbRouter.get("/movies/popular", async (req, res) => {
    try {
        const page = req.query.page ? Number(req.query.page) : undefined;
        const data = await tmdbService.getPopularMovies(page ? { page } : undefined);
        res.json(data);
    } catch (e) {
        res
            .status(500)
            .json({ error: e instanceof Error ? e.message : "Unknown error" });
    }
});

tmdbRouter.get("/movies/top-rated", async (req, res) => {
    try {
        const page = req.query.page ? Number(req.query.page) : undefined;
        const data = await tmdbService.getTopRatedMovies(page ? { page } : undefined);
        res.json(data);
    } catch (e) {
        res
            .status(500)
            .json({ error: e instanceof Error ? e.message : "Unknown error" });
    }
});

tmdbRouter.get("/movies/now-playing", async (req, res) => {
    try {
        const page = req.query.page ? Number(req.query.page) : undefined;
        const data = await tmdbService.getNowPlayingMovies(page ? { page } : undefined);
        res.json(data);
    } catch (e) {
        res
            .status(500)
            .json({ error: e instanceof Error ? e.message : "Unknown error" });
    }
});

tmdbRouter.get("/movies/upcoming", async (req, res) => {
    try {
        const page = req.query.page ? Number(req.query.page) : undefined;
        const data = await tmdbService.getUpcomingMovies(page ? { page } : undefined);
        res.json(data);
    } catch (e) {
        res
            .status(500)
            .json({ error: e instanceof Error ? e.message : "Unknown error" });
    }
});

tmdbRouter.get("/movies/trending", async (req, res) => {
    try {
        const data = await tmdbService.getTrendingMovies();
        res.json(data);
    } catch (e) {
        res
            .status(500)
            .json({ error: e instanceof Error ? e.message : "Unknown error" });
    }
});

tmdbRouter.get("/movies/search", async (req, res) => {
    try {
        const query = req.query.q as string | undefined;
        if (!query) {
            return res.status(400).json({ error: "Missing query parameter 'q'" });
        }
        const page = req.query.page ? Number(req.query.page) : undefined;
        const data = await tmdbService.searchMovies(query, page);
        res.json(data);
    } catch (e) {
        res
            .status(500)
            .json({ error: e instanceof Error ? e.message : "Unknown error" });
    }
});

tmdbRouter.get("/movies/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const data = await tmdbService.getMovieDetails(id);
        res.json(data);
    } catch (e) {
        res
            .status(500)
            .json({ error: e instanceof Error ? e.message : "Unknown error" });
    }
});

tmdbRouter.get("/movies/:id/credits", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const data = await tmdbService.getMovieCredits(id);
        res.json(data);
    } catch (e) {
        res
            .status(500)
            .json({ error: e instanceof Error ? e.message : "Unknown error" });
    }
});

tmdbRouter.get("/movies/:id/images", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const data = await tmdbService.getMovieImages(id);
        res.json(data);
    } catch (e) {
        res
            .status(500)
            .json({ error: e instanceof Error ? e.message : "Unknown error" });
    }
});

tmdbRouter.get("/movies/:id/videos", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const data = await tmdbService.getMovieVideos(id);
        res.json(data);
    } catch (e) {
        res
            .status(500)
            .json({ error: e instanceof Error ? e.message : "Unknown error" });
    }
});

tmdbRouter.get("/movies/:id/recommendations", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const page = req.query.page ? Number(req.query.page) : undefined;
        const data = await tmdbService.getMovieRecommendations(id, page);
        res.json(data);
    } catch (e) {
        res
            .status(500)
            .json({ error: e instanceof Error ? e.message : "Unknown error" });
    }
});

tmdbRouter.get("/movies/:id/similar", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const page = req.query.page ? Number(req.query.page) : undefined;
        const data = await tmdbService.getSimilarMovies(id, page);
        res.json(data);
    } catch (e) {
        res
            .status(500)
            .json({ error: e instanceof Error ? e.message : "Unknown error" });
    }
});

tmdbRouter.get("/movies/:id/watch-providers", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const data = await tmdbService.getMovieWatchProviders(id);
        res.json(data);
    } catch (e) {
        res
            .status(500)
            .json({ error: e instanceof Error ? e.message : "Unknown error" });
    }
});

// ---------- TV ----------

tmdbRouter.get("/tv/popular", async (req, res) => {
    try {
        const page = req.query.page ? Number(req.query.page) : undefined;
        const data = await tmdbService.getPopularTv(page ? { page } : undefined);
        res.json(data);
    } catch (e) {
        res
            .status(500)
            .json({ error: e instanceof Error ? e.message : "Unknown error" });
    }
});

tmdbRouter.get("/tv/top-rated", async (req, res) => {
    try {
        const page = req.query.page ? Number(req.query.page) : undefined;
        const data = await tmdbService.getTopRatedTv(page ? { page } : undefined);
        res.json(data);
    } catch (e) {
        res
            .status(500)
            .json({ error: e instanceof Error ? e.message : "Unknown error" });
    }
});

tmdbRouter.get("/tv/airing-today", async (req, res) => {
    try {
        const page = req.query.page ? Number(req.query.page) : undefined;
        const data = await tmdbService.getAiringTodayTv(page ? { page } : undefined);
        res.json(data);
    } catch (e) {
        res
            .status(500)
            .json({ error: e instanceof Error ? e.message : "Unknown error" });
    }
});

tmdbRouter.get("/tv/on-the-air", async (req, res) => {
    try {
        const page = req.query.page ? Number(req.query.page) : undefined;
        const data = await tmdbService.getOnTheAirTv(page ? { page } : undefined);
        res.json(data);
    } catch (e) {
        res
            .status(500)
            .json({ error: e instanceof Error ? e.message : "Unknown error" });
    }
});

tmdbRouter.get("/tv/trending", async (req, res) => {
    try {
        const data = await tmdbService.getTrendingTv();
        res.json(data);
    } catch (e) {
        res
            .status(500)
            .json({ error: e instanceof Error ? e.message : "Unknown error" });
    }
});

tmdbRouter.get("/tv/search", async (req, res) => {
    try {
        const query = req.query.q as string | undefined;
        if (!query) {
            return res.status(400).json({ error: "Missing query parameter 'q'" });
        }
        const page = req.query.page ? Number(req.query.page) : undefined;
        const data = await tmdbService.searchTv(query, page);
        res.json(data);
    } catch (e) {
        res
            .status(500)
            .json({ error: e instanceof Error ? e.message : "Unknown error" });
    }
});

tmdbRouter.get("/tv/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const data = await tmdbService.getTvDetails(id);
        res.json(data);
    } catch (e) {
        res
            .status(500)
            .json({ error: e instanceof Error ? e.message : "Unknown error" });
    }
});

tmdbRouter.get("/tv/:id/credits", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const data = await tmdbService.getTvCredits(id);
        res.json(data);
    } catch (e) {
        res
            .status(500)
            .json({ error: e instanceof Error ? e.message : "Unknown error" });
    }
});

tmdbRouter.get("/tv/:id/images", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const data = await tmdbService.getTvImages(id);
        res.json(data);
    } catch (e) {
        res
            .status(500)
            .json({ error: e instanceof Error ? e.message : "Unknown error" });
    }
});

tmdbRouter.get("/tv/:id/videos", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const data = await tmdbService.getTvVideos(id);
        res.json(data);
    } catch (e) {
        res
            .status(500)
            .json({ error: e instanceof Error ? e.message : "Unknown error" });
    }
});

tmdbRouter.get("/tv/:id/seasons/:season", async (req, res) => {
    try {
        const tvId = Number(req.params.id);
        const season = Number(req.params.season);
        const data = await tmdbService.getTvSeason(tvId, season);
        res.json(data);
    } catch (e) {
        res
            .status(500)
            .json({ error: e instanceof Error ? e.message : "Unknown error" });
    }
});

tmdbRouter.get("/tv/:id/recommendations", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const page = req.query.page ? Number(req.query.page) : undefined;
        const data = await tmdbService.getTvRecommendations(id, page);
        res.json(data);
    } catch (e) {
        res
            .status(500)
            .json({ error: e instanceof Error ? e.message : "Unknown error" });
    }
});

tmdbRouter.get("/tv/:id/similar", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const page = req.query.page ? Number(req.query.page) : undefined;
        const data = await tmdbService.getSimilarTv(id, page);
        res.json(data);
    } catch (e) {
        res
            .status(500)
            .json({ error: e instanceof Error ? e.message : "Unknown error" });
    }
});

tmdbRouter.get("/tv/:id/watch-providers", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const data = await tmdbService.getTvWatchProviders(id);
        res.json(data);
    } catch (e) {
        res
            .status(500)
            .json({ error: e instanceof Error ? e.message : "Unknown error" });
    }
});