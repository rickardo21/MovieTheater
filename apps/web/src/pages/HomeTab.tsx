import { useEffect, useState } from "react";
import { ItemCard, PlayButton, AddToListBtn } from "@movietheater/ui";
import { useClient } from "../store/ClientContext";
import { enrichWithHeroImages } from "../utils";
import { getMovieHeroImages } from "@movietheater/shared/src/api";

const BG_BASE_URL = "https://image.tmdb.org/t/p/";

export const HomeTab = () => {
    const [movies, setMovies] = useState<any[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [topFilm, setTopFilm] = useState<any | null>(null);
    const [rowFilm, setRowFilm] = useState<any[] | null>(null);

    const client = useClient();

    const getMovie = async () => {
        try {
            setIsLoading(true);
            const response = await client.movies.getTrending();

            if (!response) return;

            const enrichedMovies = await enrichWithHeroImages(
                response.results,
                (id) => getMovieHeroImages(id)
            )

            setMovies(response.results);
            setTopFilm(enrichedMovies[0]);
            setRowFilm(enrichedMovies.slice(1));

        } catch (err) {
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        getMovie();
    }, [])

    if (isLoading || !movies || !topFilm) return (
        <div className="h-screen w-full flex items-center justify-center">
            <p className="text-white">Loading...</p>
        </div>
    )

    return (
        <div className="h-screen w-full bg-cover bg-center bg-no-repeat top-0" style={{ backgroundImage: `url('${BG_BASE_URL}/original${topFilm.bg}')` }}>
            <div className="h-full w-full px-8 py-4 bg-black/40">
                <div className="flex items-start justify-end flex-col gap-7 h-full">
                    <img className="object-cover w-1/3" src={`${BG_BASE_URL}/w780${topFilm.logo}`} alt="" />
                    <p className="text-white w-2/4 text-sm">{topFilm.overview}</p>
                    <div className="flex gap-5">
                        <PlayButton item={topFilm} />
                        <AddToListBtn id={topFilm.id} type="movie" />
                    </div>
                    <div className="w-full p-2.5 h-47.5 backdrop-blur-2xl rounded-[34px] flex items-center justify-around gap-7.5">
                        {rowFilm?.slice(0, 5).map((film, index) => {
                            return (
                                <ItemCard type="movie" key={index} index={index} item={film} />
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}
