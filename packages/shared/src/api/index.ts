import { TMDB } from 'tmdb-ts';
import { MovieService } from './movie';
import { TvService } from './tv';

export class ApiClient {
    public readonly movies: MovieService;
    public readonly tv: TvService;

    public constructor(token: string) {
        const tmdb = new TMDB(token, {
            fetch: (...args: Parameters<typeof fetch>) => fetch(...args),
        });

        this.movies = new MovieService(tmdb);
        this.tv = new TvService(tmdb);
    }
}

export const createApiClient = (token: string): ApiClient => {
    return new ApiClient(token);
};