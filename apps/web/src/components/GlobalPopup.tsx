import { useEffect, useRef, useState } from "react";

import SFIcon from "@bradleyhodges/sfsymbols-react";
import { sfChevronDown, sfPlus, sfXmark, sfChevronBackwardChevronBackwardDotted, sfChevronForwardDottedChevronForward } from "@bradleyhodges/sfsymbols";
import { useClient } from "../store/ClientContext";
import { enrichWithHeroImages } from "../utils";
import { usePopupManager } from "../store/PopupContext";
import { ItemCard, PlayButton, Popup } from "@movietheater/ui";


const BG_BASE_URL = "https://image.tmdb.org/t/p/";

export const GlobalPopup = () => {
    const { playVideo, activeItem, activeType, closePopup } = usePopupManager();
    const client = useClient();

    const [recMovies, setRecMovies] = useState<any[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [details, setDetails] = useState<any | null>(null);

    const [season, setSeason] = useState<any | null>(null)
    const [seasonIndex, setSeasonIndex] = useState<number>(1);
    const [pagingIndex, setPagingIndex] = useState<number>(1);
    const [seasonSelectOpen, setSeasonSelectOpen] = useState(false);

    const episodesSectionRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);


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
    }

    const getDetails = async () => {
        try {
            setIsLoading(true);

            let showDetails;
            let heroImages;

            if (activeType === "movie") {
                showDetails = await client.movies.getDetails(activeItem.id);
                heroImages = await client.movies.getHeroImages(activeItem.id);
            } else if (activeType === "tv") {
                showDetails = await client.tv.getDetails(activeItem.id);
                heroImages = await client.tv.getHeroImages(activeItem.id);
            }

            if (showDetails) {
                setDetails({
                    ...showDetails,
                    bg: heroImages?.backdrop?.file_path ?? showDetails.backdrop_path,
                    logo: heroImages?.logo?.file_path
                });
            }

        } catch (err) {
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    }

    const getSeason = async () => {
        try {
            setIsLoading(true);

            let seasons = await client.tv.getSeason(activeItem.id, seasonIndex);
            setSeason(seasons);

            console.log(seasons);
        } catch (err) {
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {

        getDetails();

        if (activeType === "tv") {
            getSeason();
        }

        if (activeItem && activeType === "movie") {
            getRecMovies();
        } else {
            setRecMovies(null);
        }
    }, [activeItem, activeType, client]);

    // Refetch season when seasonIndex changes
    useEffect(() => {
        if (activeItem && activeType === "tv") {
            getSeason();
            setPagingIndex(1);
        }
    }, [seasonIndex]);

    // Scroll snap: on first wheel event, scroll to episodes section
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container || activeType !== "tv") return;

        let snapped = false;
        const handleWheel = (e: WheelEvent) => {
            if (!snapped && e.deltaY > 0 && episodesSectionRef.current) {
                snapped = true;
                episodesSectionRef.current.scrollIntoView({ behavior: "smooth" });
            }
        };

        container.addEventListener("wheel", handleWheel, { passive: true });
        return () => container.removeEventListener("wheel", handleWheel);
    }, [activeType, details]);

    if (!activeItem) return null;

    if (isLoading) return <div className="w-full flex items-center justify-center"> loading ...</div>

    // Available seasons (from TMDB details, exclude specials season 0)
    const availableSeasons = details?.seasons?.filter((s: any) => s.season_number > 0) ?? [];

    return (
        <Popup
            isOpen={!!details}
            onClose={closePopup}
            backdrop
            size={"xl"}
            position={"center"}
            backgroundImage={details?.bg ? `${BG_BASE_URL}/original${details.bg}` : undefined}
            logoImage={details?.logo ? `${BG_BASE_URL}/original${details.logo}` : undefined}
            scrollContainerRef={scrollContainerRef}
        >
            <div className="h-full w-full flex flex-col gap-7 px-6 pt-6 items-start justify-end mb-8">

                {details?.bg &&
                    <>
                        <div
                            style={{ backgroundImage: `url('${BG_BASE_URL}/original${details.bg}')` }}
                            className="absolute top-0 -z-1 left-0 h-87.5 w-full bg-cover bg-center bg-no-repeat"
                        ></div>
                        <div className="w-full h-87.5 -z-1  bg-linear-to-b from-transparent to-[#1e1e1e] absolute top-0 left-0" />
                    </>
                }
                {details?.logo &&
                    <div className="w-full flex justify-between">
                        <img className="object-cover w-1/3" src={`${BG_BASE_URL}/w780${details.logo}`} alt="" />
                        <div onClick={closePopup} className="backdrop-blur-2xl cursor-pointer shadow-[0_3px_10px_rgb(0,0,0,0.2)] w-10  transition-all duration-300 rounded-full flex items-center justify-center top-4 h-10 ">
                            <SFIcon icon={sfXmark} size={14} className="cursor-pointer text-white" />
                        </div>
                    </div>
                }
                <p className="text-white w-3/4 font-medium text-base">{details?.overview}</p>
                <div className="flex gap-5">
                    {details?.id && <PlayButton id={details.id} />}
                    <div className="w-54 cursor-pointer text-white h-14 rounded-2xl font-semibold text-[20px] gap-4 bg-linear-to-r from-[#363636] to-[#131313] flex items-center justify-center">
                        <SFIcon icon={sfPlus} size={28} />
                        <span>Add to List</span>
                    </div>
                </div>
            </div>

            <section className="px-6 bg-[#1e1e1e]">
                {activeType === "movie" ? (

                    <div className="w-full text-white ">
                        <span className="font-semibold text-2xl">Consigliati</span>
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
                    <div className="w-full flex flex-col text-white">
                        <div className="flex w-full justify-between items-center">
                            <span className="font-semibold text-2xl">Episodi</span>

                            {/* select season — custom Apple-style */}
                            <div className="relative">
                                <button
                                    onClick={() => setSeasonSelectOpen(o => !o)}
                                    className="flex items-center gap-2 px-4 h-10 rounded-2xl backdrop-blur-lg bg-white/8 border border-white/10 text-white font-semibold text-sm cursor-pointer transition-all duration-200 hover:bg-white/15"
                                >
                                    <span>{availableSeasons.find((s: any) => s.season_number === seasonIndex)?.name ?? `Season ${seasonIndex}`}</span>
                                    <SFIcon icon={sfChevronDown} size={12} style={{ transition: "transform 0.2s", transform: seasonSelectOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
                                </button>

                                {seasonSelectOpen && (
                                    <div
                                        className="absolute right-0 top-12 z-50 min-w-52 rounded-2xl overflow-hidden"
                                        style={{
                                            background: "rgba(30,30,30,0.85)",
                                            backdropFilter: "blur(40px) saturate(180%)",
                                            WebkitBackdropFilter: "blur(40px) saturate(180%)",
                                            border: "1px solid rgba(255,255,255,0.1)",
                                            boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
                                        }}
                                    >
                                        {availableSeasons.map((s: any) => (
                                            <button
                                                key={s.season_number}
                                                onClick={() => {
                                                    setSeasonIndex(s.season_number);
                                                    setSeasonSelectOpen(false);
                                                }}
                                                className={[
                                                    "w-full flex items-center justify-between px-4 py-3 text-sm cursor-pointer transition-colors duration-150",
                                                    "hover:bg-white/10",
                                                    s.season_number === seasonIndex
                                                        ? "text-[#ff3b30] font-semibold"
                                                        : "text-white font-medium",
                                                ].join(" ")}
                                            >
                                                <span>{s.name}</span>
                                                <span className="text-white/40 text-xs font-normal ml-4">{s.episode_count} ep</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div ref={episodesSectionRef} className="w-full h-[90vh] flex justify-between py-5 flex-col gap-4">
                            {season?.episodes?.slice((pagingIndex - 1) * 7, pagingIndex * 7).map((episode: any, index: number) => (
                                <div onClick={() => {
                                    playVideo(episode.id);
                                    closePopup();
                                }} key={index} className="w-full max-h-20 min-h-19 flex items-center justify-start gap-4">
                                    <div
                                        style={{ backgroundImage: `url('${BG_BASE_URL}/original${episode.still_path}')` }}
                                        className="bg-[#1b1b1b] cursor-pointer bg-contain relative bg-no-repeat bg-right group w-full grid grid-cols-[100px_1fr_150px]  h-full overflow-hidden rounded-xl">
                                        <span
                                            style={{
                                                background: `linear-gradient(to bottom, #ff3b30 70%, rgba(255,255,255,0.4) 30%)`,
                                                WebkitBackgroundClip: 'text',
                                                backgroundClip: 'text',
                                                color: 'transparent',
                                            }}
                                            className=" z-2 tracking-[-20px] text-[90px] -translate-x-2.5 w-full overflow-hidden flex items-center justify-center h-full font-bold">{episode.episode_number}</span>
                                        <div className="flex flex-col items-start py-2 justify-center">
                                            <div className="flex w-full  justify-between">
                                                <span className="font-medium text-[20px]">{episode.name}</span>
                                                {/* <span className="text-white/60 text-sm text-center translate-y-50 invisible group-hover:visible group-hover:translate-y-0 transition-all duration-300 ease-in-out  flex font-semibold items-center justify-end">{episode.runtime} Min</span> */}
                                            </div>
                                            <p className="text-xs  text-white/60 w-3/4 ">{episode.overview.slice(0, 100)}</p>
                                        </div>
                                        <div className="flex items-center justify-center bg-linear-to-r w-full from-[#1b1b1b] to-transparent">
                                            {/* <SFIcon icon={sfPlayFill} color="#FFFFFF" size={28}/> */}

                                        </div>
                                    </div>
                                </div>
                            ))}

                            {season?.episodes?.length > 7 && (
                                <div className="h-4 w-full flex items-center justify-center gap-2 text-white">
                                    <SFIcon onClickCapture={() => setPagingIndex(pagingIndex - 1)} icon={sfChevronBackwardChevronBackwardDotted} size={12} color="#fff" style={{ opacity: pagingIndex === 1 ? "0.2" : "1", cursor: pagingIndex === 1 ? "default" : "pointer" }} />
                                    <span className="text-white font-medium text-sm">{pagingIndex}</span>
                                    <SFIcon onClickCapture={() => setPagingIndex(pagingIndex + 1)} icon={sfChevronForwardDottedChevronForward} size={12} color="#fff" style={{ opacity: pagingIndex === Math.ceil(season?.episodes?.length / 7) ? "0.2" : "1", cursor: pagingIndex === Math.ceil(season?.episodes?.length / 7) ? "default" : "pointer" }} />
                                </div>
                            )}

                        </div>

                    </div>
                )}
            </section>
        </Popup>
    );
};
