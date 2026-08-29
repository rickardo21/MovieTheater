import { useEffect, useState } from "react";
import { useClient } from "../store/ClientContext"
import { useNavBar } from "../store/NavBarContext";
import { Loader } from "lucide-react";
import { ItemCard } from "@movietheater/ui";
import { enrichWithHeroImages } from "../utils";



const MoviesPage = () => {

    const client = useClient();
    const { searchQuery } = useNavBar();

    const [movies, setMovies] = useState<any[] | null>(null);
    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const fetchMovies = async () => {
        try {
            setIsLoading(true);
            const res = await client.movies.getByKeyword(searchQuery || "")

            if (res.results == null) return;

            const enrichedMovies = await enrichWithHeroImages(
                res.results,
                (id) => client.movies.getHeroImages(id)
            )

            setMovies(enrichedMovies);

        } catch (error: any) {
            setError(error?.message || "Something went wrong")
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (searchQuery != null && searchQuery.length > 0) {
            fetchMovies();
            setError("");
        }
    }, [searchQuery])

    return (
        <div className="h-full w-full pt-28 pb-8 px-8 flex flex-col gap-8">
            <span className="text-2xl font-semibold text-white">TV Shows</span>

            {isLoading && (
                <div className="w-full h-full flex items-center justify-center gap-2 flex-col">
                    <Loader className="text-white animate-spin" size={24} />
                    <span className="text-white text-sm font-semibold">Loading...</span>
                </div>
            )}
            <div className="w-full h-full flex items-start justify-start flex-wrap gap-7.5">
                {movies?.map((movie, index) => {
                    return movie.logo ? (
                        <ItemCard type="movie" item={movie} index={index} />
                    ) : null
                })}
            </div>

            {error && <span className="text-red-500 text-sm font-semibold">{error}</span>}
        </div>
    )
}

export default MoviesPage