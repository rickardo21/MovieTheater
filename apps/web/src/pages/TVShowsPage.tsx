import { useEffect, useState } from "react";
import { useClient } from "../store/ClientContext"
import { useNavBar } from "../store/NavBarContext";
import { Loader } from "lucide-react";
import { ItemCard } from "@movietheater/ui";
import { enrichWithHeroImages } from "../utils";
import { getTvHeroImages } from "@movietheater/shared/src/api";



import { useDebounce } from "../hooks/useDebounce";
import { clientCache } from "../utils/cache";

const TVShowsPage = () => {

    const client = useClient();
    const { searchQuery } = useNavBar();

    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    const [shows, setShows] = useState<any[] | null>(null);
    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);



    const fetchTVShows = async (query: string) => {
        try {
            const cachedResult = clientCache.get(`tv_search_${query}`);
            if (cachedResult) {
                setShows(cachedResult);
                return;
            }

            setIsLoading(true);
            const res = await client.tv.searchTv(query)

            if (res.results == null) return;

            const enrichedShows = await enrichWithHeroImages(
                res.results,
                (id) => getTvHeroImages(id)
            )

            clientCache.set(`tv_search_${query}`, enrichedShows, 300000); // 5 minutes cache
            setShows(enrichedShows);
        } catch (error: any) {
            setError(error?.message || "Something went wrong")
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (debouncedSearchQuery != null && debouncedSearchQuery.length > 0) {
            fetchTVShows(debouncedSearchQuery);
            setError("");
        }
    }, [debouncedSearchQuery])

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
                {shows?.map((show, index) => {
                    return show.logo ? (
                        <ItemCard type="tv" item={show} index={index} />
                    ) : null
                })}
            </div>
            {error && <span className="text-red-500 text-sm font-semibold">{error}</span>}
        </div>
    )
}

export default TVShowsPage