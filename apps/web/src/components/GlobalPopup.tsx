import { useEffect, useState } from "react";

import SFIcon from "@bradleyhodges/sfsymbols-react";
import { sfPlus } from "@bradleyhodges/sfsymbols";
import { useClient } from "../store/ClientContext";
import { enrichWithHeroImages } from "../utils";
import { usePopupManager } from "../store/PopupContext";
import { ItemCard, PlayButton, Popup } from "@movietheater/ui";


const BG_BASE_URL = "https://image.tmdb.org/t/p/";

export const GlobalPopup = () => {
    const { activeItem, activeType, closePopup } = usePopupManager();
    const client = useClient();

    const [recMovies, setRecMovies] = useState<any[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (activeItem && activeType === "movie") {
            const getRecMovies = async () => {
                try {
                    setIsLoading(true);
                    const resp = await client.movies.getRecommendations(activeItem.id);
                    if (!resp) return;

                    const enrichedMovies = await enrichWithHeroImages(
                        resp.results,
                        (id) => client.movies.getHeroImages(id)
                    );

                    setRecMovies(enrichedMovies);
                } catch (err) {
                    console.log(err);
                } finally {
                    setIsLoading(false);
                }
            };
            getRecMovies();
        } else {
            setRecMovies(null);
        }
    }, [activeItem, activeType, client]);

    if (!activeItem) return null;

    return (
        <Popup
            isOpen={!!activeItem}
            onClose={closePopup}
            backdrop
            size={"xl"}
            position={"center"}
            backgroundImage={`${BG_BASE_URL}/original${activeItem.bg}`}
            logoImage={`${BG_BASE_URL}/original${activeItem.logo}`}
        >
            <div className="h-87.5 w-full flex flex-col gap-7 items-start justify-end mb-8">
                <img className="object-cover w-1/3" src={`${BG_BASE_URL}/w780${activeItem.logo}`} alt="" />
                <p className="text-white w-3/4 font-medium text-base">{activeItem.overview}</p>
                <div className="flex gap-5">
                    <PlayButton id={activeItem.id}/>
                    <div className="w-54 cursor-pointer text-white h-14 rounded-2xl font-semibold text-28px gap-4 bg-linear-to-r from-[#363636] to-[#131313] flex items-center justify-center">
                        <SFIcon icon={sfPlus} size={28} />
                        <span>Add to List</span>
                    </div>
                </div>
            </div>

            {activeType === "movie" ? (
                <div className="w-full text-white ">
                    <span className="font-semibold text-lg">Consigliati</span>
                    <div className="w-full p-2.5 mt-2.5 h-47.5 overflow-auto backdrop-blur-2xl rounded-[34px] flex items-center justify-around gap-7.5">
                        {isLoading
                            ? Array.from({ length: 5 }).map((_, index) => (
                                <ItemCard type="movie" skeleton key={`skeleton-${index}`} index={index} />
                            ))
                            : recMovies && recMovies.length > 0
                                ? recMovies.map((film, index) => (
                                    <ItemCard type="movie" key={film.id ?? index} index={index} item={film} />
                                ))
                                : <span className="text-white/60 text-sm">Nessun contenuto consigliato disponibile</span>
                        }
                    </div>
                </div>
            ) : (
                <div className="w-full text-white">
                    <span className="font-semibold text-xl">Episodi</span>
                </div>
            )}
        </Popup>
    );
};
