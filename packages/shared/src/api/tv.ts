import { TMDB } from 'tmdb-ts';

export class TvService {
    private readonly tmdb: TMDB;

    public constructor(tmdb: TMDB) {
        this.tmdb = tmdb;
    }

    /**
     * Recupera i dettagli di una serie TV.
     *
     * @param tvId Identificativo TMDB della serie.
     * @returns Promise contenente i dettagli completi della serie.
     */
    public getDetails(tvId: number) {
        return this.tmdb.tvShows.details(tvId);
    }

    /**
     * Recupera i dettagli di una stagione specifica di una serie.
     *
     * @param tvId Identificativo TMDB della serie.
     * @param seasonNumber Numero della stagione (1-based).
     * @returns Promise contenente i dettagli della stagione (inclusi gli episodi).
     */
    public getSeason(tvId: number, seasonNumber: number) {
        return this.tmdb.tvShows.season(tvId, seasonNumber);
    }

    /**
     * Recupera i crediti (cast e crew) di una serie TV.
     *
     * @param tvId Identificativo TMDB della serie.
     * @returns Promise contenente cast e crew della serie.
     */
    public getCredits(tvId: number) {
        return this.tmdb.tvShows.credits(tvId);
    }

    /**
     * Recupera le immagini (backdrop, poster, ...) di una serie TV.
     *
     * @param tvId Identificativo TMDB della serie.
     * @returns Promise contenente la collezione di immagini della serie.
     */
    public getImages(tvId: number) {
        return this.tmdb.tvShows.images(tvId);
    }

    /**
     * Recupera i video (trailer, teaser, clip, ...) di una serie TV.
     *
     * @param tvId Identificativo TMDB della serie.
     * @returns Promise contenente la lista dei video della serie.
     */
    public getVideos(tvId: number) {
        return this.tmdb.tvShows.videos(tvId);
    }

    /**
     * Recupera le recensioni di una serie TV.
     *
     * @param tvId Identificativo TMDB della serie.
     * @param options Opzioni per paginazione.
     * @returns Promise contenente le recensioni della serie.
     */
    public getReviews(tvId: number, options?: { page?: number }) {
        return this.tmdb.tvShows.reviews(tvId, options);
    }

    /**
     * Recupera le serie TV consigliate simili a una data serie.
     *
     * @param tvId Identificativo TMDB della serie.
     * @param options Opzioni per paginazione.
     * @returns Promise contenente la lista di serie consigliate.
     */
    public getRecommendations(tvId: number, options?: { page?: number }) {
        return this.tmdb.tvShows.recommendations(tvId, options);
    }

    /**
     * Recupera le serie TV simili a una data serie.
     *
     * @param tvId Identificativo TMDB della serie.
     * @param options Opzioni per paginazione.
     * @returns Promise contenente la lista di serie simili.
     */
    public getSimilar(tvId: number, options?: { page?: number }) {
        return this.tmdb.tvShows.similar(tvId, options);
    }

    /**
     * Recupera i provider di streaming/rent/buy per una serie TV.
     *
     * @param tvId Identificativo TMDB della serie.
     * @returns Promise contenente i watch providers della serie.
     */
    public getWatchProviders(tvId: number) {
        return this.tmdb.tvShows.watchProviders(tvId);
    }

    /**
     * Recupera la lista delle serie TV popolari.
     *
     * @param options Opzioni per paginazione.
     * @returns Promise contenente la lista delle serie popolari.
     */
    public getPopular(options?: { page?: number }) {
        return this.tmdb.tvShows.popular(options);
    }

    /**
     * Recupera la lista delle serie TV con valutazione più alta.
     *
     * @param options Opzioni per paginazione.
     * @returns Promise contenente la lista delle serie top rated.
     */
    public getTopRated(options?: { page?: number }) {
        return this.tmdb.tvShows.topRated(options);
    }

    /**
     * Recupera la lista delle serie TV in onda ("on the air").
     *
     * @param options Opzioni per paginazione.
     * @returns Promise contenente la lista delle serie in onda.
     */
    public getOnTheAir(options?: { page?: number }) {
        return this.tmdb.tvShows.onTheAir(options);
    }

    /**
     * Recupera la lista delle serie TV in onda oggi ("airing today").
     *
     * @param options Opzioni per paginazione.
     * @returns Promise contenente la lista delle serie in onda oggi.
     */
    public getAiringToday(options?: { page?: number }) {
        return this.tmdb.tvShows.airingToday(options);
    }

    /**
     * Recupera i crediti esterni (IMDb, ecc.) di una serie TV.
     *
     * @param tvId Identificativo TMDB della serie.
     * @returns Promise contenente gli ID esterni della serie.
     */
    public getExternalIds(tvId: number) {
        return this.tmdb.tvShows.externalIds(tvId);
    }

    /**
     * Recupera le traduzioni disponibili per una serie TV.
     *
     * @param tvId Identificativo TMDB della serie.
     * @returns Promise contenente le traduzioni della serie.
     */
    public getTranslations(tvId: number) {
        return this.tmdb.tvShows.translations(tvId);
    }



    /**
     * Recupera le modifiche recenti a una serie TV.
     *
     * @param tvId Identificativo TMDB della serie.
     * @returns Promise contenente le modifiche alla serie.
     */
    public getChanges(tvId: number) {
        return this.tmdb.tvShows.changes(tvId);
    }

    /**
     * Recupera l'ultima serie TV aggiunta su TMDB.
     *
     * @returns Promise contenente i dettagli dell'ultima serie aggiunta.
     */
    public getLatest() {
        return this.tmdb.tvShows.latest();
    }

    /**
     * Recupera le serie TV di tendenza della settimana.
     *
     * @returns Promise contenente le serie trending.
     */
    public getTrending() {
        return this.tmdb.trending.trending('tv', 'week');
    }


    public getByKeyword(keyword: string) {
        return this.tmdb.search.tvShows({
            query: keyword
        })
    }

    /**
     * Recupera le immagini hero principali di una serie TV (backdrop e logo).
     *
     * Seleziona il backdrop con il voto più alto e preferisce un logo inglese.
     *
     * @param tvId Identificativo TMDB della serie.
     * @returns Promise contenente backdrop e logo selezionati.
     */
    public async getHeroImages(tvId: number) {
        const images = await this.getImages(tvId);

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
}