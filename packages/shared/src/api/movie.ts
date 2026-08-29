import { TMDB } from 'tmdb-ts';

export class MovieService {
    private readonly tmdb: TMDB;

    public constructor(tmdb: TMDB) {
        this.tmdb = tmdb;
    }

    /**
     * Recupera i dettagli di un film.
     *
     * @param movieId Identificativo TMDB del film.
     * @returns Promise contenente i dettagli completi del film.
     */
    public getDetails(movieId: number) {
        return this.tmdb.movies.details(movieId);
    }

    /**
     * Recupera i crediti (cast e crew) di un film.
     *
     * @param movieId Identificativo TMDB del film.
     * @returns Promise contenente cast e crew del film.
     */
    public getCredits(movieId: number) {
        return this.tmdb.movies.credits(movieId);
    }

    /**
     * Recupera le immagini (backdrop, poster, logo, ...) di un film.
     *
     * @param movieId Identificativo TMDB del film.
     * @returns Promise contenente la collezione di immagini del film.
     */
    public getImages(movieId: number) {
        return this.tmdb.movies.images(movieId);
    }

    /**
     * Recupera i video (trailer, teaser, clip, ...) di un film.
     *
     * @param movieId Identificativo TMDB del film.
     * @returns Promise contenente la lista dei video del film.
     */
    public getVideos(movieId: number) {
        return this.tmdb.movies.videos(movieId);
    }

    /**
     * Recupera le recensioni di un film.
     *
     * @param movieId Identificativo TMDB del film.
     * @param options Opzioni per paginazione e lingua.
     * @returns Promise contenente le recensioni del film.
     */
    public getReviews(movieId: number, options?: { page?: number }) {
        return this.tmdb.movies.reviews(movieId, options);
    }

    /**
     * Recupera i film consigliati simili a un dato film.
     *
     * @param movieId Identificativo TMDB del film.
     * @param options Opzioni per paginazione.
     * @returns Promise contenente la lista di film consigliati.
     */
    public getRecommendations(movieId: number, options?: { page?: number }) {
        return this.tmdb.movies.recommendations(movieId, options);
    }

    /**
     * Recupera i film simili a un dato film.
     *
     * @param movieId Identificativo TMDB del film.
     * @param options Opzioni per paginazione.
     * @returns Promise contenente la lista di film simili.
     */
    public getSimilar(movieId: number, options?: { page?: number }) {
        return this.tmdb.movies.similar(movieId, options);
    }

    /**
     * Recupera i provider di streaming/rent/buy per un film.
     *
     * @param movieId Identificativo TMDB del film.
     * @returns Promise contenente i watch providers del film.
     */
    public getWatchProviders(movieId: number) {
        return this.tmdb.movies.watchProviders(movieId);
    }

    /**
     * Recupera la lista dei film popolari.
     *
     * @param options Opzioni per paginazione.
     * @returns Promise contenente la lista dei film popolari.
     */
    public getPopular(options?: { page?: number }) {
        return this.tmdb.movies.popular(options);
    }

    /**
     * Recupera la lista dei film con valutazione più alta.
     *
     * @param options Opzioni per paginazione.
     * @returns Promise contenente la lista dei film top rated.
     */
    public getTopRated(options?: { page?: number }) {
        return this.tmdb.movies.topRated(options);
    }

    /**
     * Recupera la lista dei film attualmente al cinema ("now playing").
     *
     * @param options Opzioni per paginazione.
     * @returns Promise contenente la lista dei film in uscita.
     */
    public getNowPlaying(options?: { page?: number }) {
        return this.tmdb.movies.nowPlaying(options);
    }

    /**
     * Recupera la lista dei film in uscita prossimamente ("upcoming").
     *
     * @param options Opzioni per paginazione.
     * @returns Promise contenente la lista dei film in uscita.
     */
    public getUpcoming(options?: { page?: number }) {
        return this.tmdb.movies.upcoming(options);
    }

    /**
     * Recupera i film di tendenza della settimana.
     *
     * @returns Promise contenente i film trending.
     */
    public getTrending() {
        return this.tmdb.trending.trending('movie', 'week');
    }

    /**
     * Recupera le immagini hero principali di un film (backdrop e logo).
     *
     * Seleziona il backdrop con il voto più alto e preferisce un logo inglese.
     *
     * @param movieId Identificativo TMDB del film.
     * @returns Promise contenente backdrop e logo selezionati.
     */
    public async getHeroImages(movieId: number) {
        const images = await this.getImages(movieId);

        const backdrop =
            images.backdrops
                ?.filter((image) => Boolean(image.file_path))
                .sort(
                    (first, second) =>
                        (second.vote_average ?? 0) - (first.vote_average ?? 0),
                )[0] ?? null;

        const logo =
            images.logos?.find((image) => image.iso_639_1 === 'en') ??
            images.logos?.find((image) => image.iso_639_1 === null) ??
            images.logos?.[0] ??
            null;

        return {
            backdrop,
            logo,
        };
    }

    /**
     * Recupera i crediti esterni (IMDb, ecc.) di un film.
     *
     * @param movieId Identificativo TMDB del film.
     * @returns Promise contenente gli ID esterni del film.
     */
    public getExternalIds(movieId: number) {
        return this.tmdb.movies.externalIds(movieId);
    }

    /**
     * Recupera le traduzioni disponibili per un film.
     *
     * @param movieId Identificativo TMDB del film.
     * @returns Promise contenente le traduzioni del film.
     */
    public getTranslations(movieId: number) {
        return this.tmdb.movies.translations(movieId);
    }

    /**
     * Recupera le liste pubbliche che contengono un film.
     *
     * @param movieId Identificativo TMDB del film.
     * @param options Opzioni per paginazione.
     * @returns Promise contenente le liste che includono il film.
     */
    public getLists(movieId: number, options?: { page?: number }) {
        return this.tmdb.movies.lists(movieId, options);
    }

    /**
     * Recupera le modifiche recenti a un film.
     *
     * @param movieId Identificativo TMDB del film.
     * @returns Promise contenente le modifiche al film.
     */
    public getChanges(movieId: number) {
        return this.tmdb.movies.changes(movieId);
    }

    /**
     * Recupera i film con parole chiave specifiche.
     *
     * @param keywordId Identificativo della keyword.
     * @param options Opzioni per paginazione.
     * @returns Promise contenente i film associati alla keyword.
     */

    public getByKeyword(keyword: string) {
        return this.tmdb.search.movies({
            query: keyword
        })
    }

    /**
     * Recupera l'ultimo film aggiunto su TMDB.
     *
     * @returns Promise contenente i dettagli dell'ultimo film aggiunto.
     */
    public getLatest() {
        return this.tmdb.movies.latest();
    }
}