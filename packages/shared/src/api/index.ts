const BASE =
    import.meta.env.VITE_API_URL || "http://192.168.1.114:4000";

async function get<T = any>(path: string): Promise<T> {
    const res = await fetch(`${BASE}${path}`);
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
    }
    return res.json() as T;
}

// Manteniamo la stessa “forma” di prima (movies, tv)
// ma sotto usano il backend, non TMDB direttamente.

export class BackendMovieService {
    public getDetails(movieId: number) {
        return get(`/api/tmdb/movies/${movieId}`);
    }

    public getCredits(movieId: number) {
        return get(`/api/tmdb/movies/${movieId}/credits`);
    }

    public getImages(movieId: number) {
        return get(`/api/tmdb/movies/${movieId}/images`);
    }

    public getVideos(movieId: number) {
        return get(`/api/tmdb/movies/${movieId}/videos`);
    }

    public getPopular(options?: { page?: number }) {
        const page = options?.page;
        return get(`/api/tmdb/movies/popular${page ? `?page=${page}` : ""}`);
    }

    public getTopRated(options?: { page?: number }) {
        const page = options?.page;
        return get(`/api/tmdb/movies/top-rated${page ? `?page=${page}` : ""}`);
    }

    public getNowPlaying(options?: { page?: number }) {
        const page = options?.page;
        return get(`/api/tmdb/movies/now-playing${page ? `?page=${page}` : ""}`);
    }

    public getUpcoming(options?: { page?: number }) {
        const page = options?.page;
        return get(`/api/tmdb/movies/upcoming${page ? `?page=${page}` : ""}`);
    }

    public getTrending() {
        return get(`/api/tmdb/movies/trending`);
    }

    public searchMovies(query: string, page?: number) {
        const qs = new URLSearchParams({ q: query });
        if (page) qs.set("page", String(page));
        return get(`/api/tmdb/movies/search?${qs.toString()}`);
    }

    public getRecommendations(movieId: number, options?: { page?: number }) {
        const page = options?.page;
        return get(`/api/tmdb/movies/${movieId}/recommendations${page ? `?page=${page}` : ""}`);
    }

    public getSimilar(movieId: number, options?: { page?: number }) {
        const page = options?.page;
        return get(`/api/tmdb/movies/${movieId}/similar${page ? `?page=${page}` : ""}`);
    }

    public getWatchProviders(movieId: number) {
        return get(`/api/tmdb/movies/${movieId}/watch-providers`);
    }
}

export class BackendTvService {
    public getDetails(tvId: number) {
        return get(`/api/tmdb/tv/${tvId}`);
    }

    public getCredits(tvId: number) {
        return get(`/api/tmdb/tv/${tvId}/credits`);
    }

    public getImages(tvId: number) {
        return get(`/api/tmdb/tv/${tvId}/images`);
    }

    public getVideos(tvId: number) {
        return get(`/api/tmdb/tv/${tvId}/videos`);
    }

    public getSeason(tvId: number, seasonNumber: number) {
        return get(`/api/tmdb/tv/${tvId}/seasons/${seasonNumber}`);
    }

    public getPopular(options?: { page?: number }) {
        const page = options?.page;
        return get(`/api/tmdb/tv/popular${page ? `?page=${page}` : ""}`);
    }

    public getTopRated(options?: { page?: number }) {
        const page = options?.page;
        return get(`/api/tmdb/tv/top-rated${page ? `?page=${page}` : ""}`);
    }

    public getAiringToday(options?: { page?: number }) {
        const page = options?.page;
        return get(`/api/tmdb/tv/airing-today${page ? `?page=${page}` : ""}`);
    }

    public getOnTheAir(options?: { page?: number }) {
        const page = options?.page;
        return get(`/api/tmdb/tv/on-the-air${page ? `?page=${page}` : ""}`);
    }

    public getTrending() {
        return get(`/api/tmdb/tv/trending`);
    }

    public searchTv(query: string, page?: number) {
        const qs = new URLSearchParams({ q: query });
        if (page) qs.set("page", String(page));
        return get(`/api/tmdb/tv/search?${qs.toString()}`);
    }

    public getRecommendations(tvId: number, options?: { page?: number }) {
        const page = options?.page;
        return get(`/api/tmdb/tv/${tvId}/recommendations${page ? `?page=${page}` : ""}`);
    }

    public getSimilar(tvId: number, options?: { page?: number }) {
        const page = options?.page;
        return get(`/api/tmdb/tv/${tvId}/similar${page ? `?page=${page}` : ""}`);
    }

    public getWatchProviders(tvId: number) {
        return get(`/api/tmdb/tv/${tvId}/watch-providers`);
    }
}

export class ApiClient {
    public readonly movies: BackendMovieService;
    public readonly tv: BackendTvService;

    public constructor() {
        this.movies = new BackendMovieService();
        this.tv = new BackendTvService();
    }
}

export const createApiClient = (): ApiClient => {
    return new ApiClient();
};

export async function getMovieHeroImages(movieId: number): Promise<{ backdrop: any; logo: any }> {
    const images = await fetch(`${BASE}/api/tmdb/movies/${movieId}/images`).then(r => r.json());

    const backdrop =
        images.backdrops
            ?.filter((img: any) => Boolean(img.file_path))
            .sort(
                (a: any, b: any) => (b.vote_average ?? 0) - (a.vote_average ?? 0)
            )[0] ?? null;

    const logo =
        images.logos?.find((img: any) => img.iso_639_1 === "en") ??
        images.logos?.find((img: any) => img.iso_639_1 == null) ??
        images.logos?.[0] ??
        null;

    return { backdrop, logo };
}

export async function getTvHeroImages(tvId: number): Promise<{ backdrop: any; logo: any }> {
    const images = await fetch(`${BASE}/api/tmdb/tv/${tvId}/images`).then(r => r.json());

    const backdrop =
        images.backdrops
            ?.filter((img: any) => Boolean(img.file_path))
            .sort(
                (a: any, b: any) => (b.vote_average ?? 0) - (a.vote_average ?? 0)
            )[0] ?? null;

    const logo =
        images.logos?.find((img: any) => img.iso_639_1 === "en") ??
        images.logos?.find((img: any) => img.iso_639_1 == null) ??
        images.logos?.[0] ??
        null;

    return { backdrop, logo };
}