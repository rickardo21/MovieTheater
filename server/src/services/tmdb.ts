import { TMDB } from "tmdb-ts";
import { serverCache } from "../utils/cache";

const token = process.env.TMDB_API_TOKEN;

if (!token) {
    throw new Error("Variabile TMDB_API_TOKEN mancante");
}

const tmdb = new TMDB(token, {
    fetch: (...args: Parameters<typeof fetch>) => fetch(...args),
});

const withCache = async <T>(key: string, fetcher: () => Promise<T>): Promise<T> => {
    const cached = serverCache.get(key);
    if (cached) return cached;

    const data = await fetcher();
    serverCache.set(key, data);
    return data;
}

export class TmdbService {
    // ---------- MOVIES ----------

    public getMovieDetails(movieId: number) {
        return withCache(`movie_details_${movieId}`, () => tmdb.movies.details(movieId));
    }

    public getMovieCredits(movieId: number) {
        return withCache(`movie_credits_${movieId}`, () => tmdb.movies.credits(movieId));
    }

    public getMovieImages(movieId: number) {
        return withCache(`movie_images_${movieId}`, () => tmdb.movies.images(movieId));
    }

    public getMovieVideos(movieId: number) {
        return withCache(`movie_videos_${movieId}`, () => tmdb.movies.videos(movieId));
    }

    public getPopularMovies(options?: { page?: number }) {
        return withCache(`movie_popular_${options?.page || 1}`, () => tmdb.movies.popular(options));
    }

    public getTopRatedMovies(options?: { page?: number }) {
        return withCache(`movie_toprated_${options?.page || 1}`, () => tmdb.movies.topRated(options));
    }

    public getNowPlayingMovies(options?: { page?: number }) {
        return withCache(`movie_nowplaying_${options?.page || 1}`, () => tmdb.movies.nowPlaying(options));
    }

    public getUpcomingMovies(options?: { page?: number }) {
        return withCache(`movie_upcoming_${options?.page || 1}`, () => tmdb.movies.upcoming(options));
    }

    public getTrendingMovies() {
        return withCache(`movie_trending`, () => tmdb.trending.trending("movie", "week", { page: 1 }));
    }

    public searchMovies(query: string, page?: number) {
        return withCache(`movie_search_${query}_${page || 1}`, () => tmdb.search.movies({
            query,
            ...(page ? { page } : {}),
        }));
    }

    public getMovieRecommendations(movieId: number, page?: number) {
        return withCache(`movie_rec_${movieId}_${page || 1}`, () => tmdb.movies.recommendations(movieId, page ? { page } : undefined));
    }

    public getSimilarMovies(movieId: number, page?: number) {
        return withCache(`movie_similar_${movieId}_${page || 1}`, () => tmdb.movies.similar(movieId, page ? { page } : undefined));
    }

    public getMovieWatchProviders(movieId: number) {
        return withCache(`movie_watchprov_${movieId}`, () => tmdb.movies.watchProviders(movieId));
    }

    // ---------- TV ----------

    public getTvDetails(tvId: number) {
        return withCache(`tv_details_${tvId}`, () => tmdb.tvShows.details(tvId));
    }

    public getTvCredits(tvId: number) {
        return withCache(`tv_credits_${tvId}`, () => tmdb.tvShows.credits(tvId));
    }

    public getTvImages(tvId: number) {
        return withCache(`tv_images_${tvId}`, () => tmdb.tvShows.images(tvId));
    }

    public getTvVideos(tvId: number) {
        return withCache(`tv_videos_${tvId}`, () => tmdb.tvShows.videos(tvId));
    }

    public getTvSeason(tvId: number, seasonNumber: number) {
        return withCache(`tv_season_${tvId}_${seasonNumber}`, () => tmdb.tvShows.season(tvId, seasonNumber));
    }

    public getPopularTv(options?: { page?: number }) {
        return withCache(`tv_popular_${options?.page || 1}`, () => tmdb.tvShows.popular(options));
    }

    public getTopRatedTv(options?: { page?: number }) {
        return withCache(`tv_toprated_${options?.page || 1}`, () => tmdb.tvShows.topRated(options));
    }

    public getAiringTodayTv(options?: { page?: number }) {
        return withCache(`tv_airingtoday_${options?.page || 1}`, () => tmdb.tvShows.airingToday(options));
    }

    public getOnTheAirTv(options?: { page?: number }) {
        return withCache(`tv_ontheair_${options?.page || 1}`, () => tmdb.tvShows.onTheAir(options));
    }

    public getTrendingTv() {
        return withCache(`tv_trending`, () => tmdb.trending.trending("tv", "week"));
    }

    public searchTv(query: string, page?: number) {
        return withCache(`tv_search_${query}_${page || 1}`, () => tmdb.search.tvShows({
            query,
            ...(page ? { page } : {}),
        }));
    }

    public getTvRecommendations(tvId: number, page?: number) {
        return withCache(`tv_rec_${tvId}_${page || 1}`, () => tmdb.tvShows.recommendations(tvId, page ? { page } : undefined));
    }

    public getSimilarTv(tvId: number, page?: number) {
        return withCache(`tv_similar_${tvId}_${page || 1}`, () => tmdb.tvShows.similar(tvId, page ? { page } : undefined));
    }

    public getTvWatchProviders(tvId: number) {
        return withCache(`tv_watchprov_${tvId}`, () => tmdb.tvShows.watchProviders(tvId));
    }
}

export const tmdbService = new TmdbService();