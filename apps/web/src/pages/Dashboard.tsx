import { sfPlus } from "@bradleyhodges/sfsymbols"
import SFIcon from "@bradleyhodges/sfsymbols-react"
import { NavBar } from "@movietheater/ui/src/components/navBar"
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useClient } from "../store/ClientContext";
import { useNavBar } from "../store/NavBarContext";
import { usePopupManager } from "../store/PopupContext";
import TVShowsPage from "./TVShowsPage";
import MoviesPage from "./MoviesPage";
import { ItemCard, PlayButton } from "@movietheater/ui";
import { enrichWithHeroImages } from "../utils";


const Dashboard = () => {

    const [movies, setMovies] = useState<any[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [topFilm, setTopFilm] = useState<any | null>(null);
    const [rowFilm, setRowFilm] = useState<any[] | null>(null);
    const { activeTab, setActiveTab, searchQuery, setSearchQuery } = useNavBar();
    const { playingVideoId } = usePopupManager();

    const client = useClient();

    const getMovie = async () => {
        try {
            setIsLoading(true);
            const response = await client.movies.getTrending();

            if (!response) return;

            const enrichedMovies = await enrichWithHeroImages(
                response.results,
                (id) => client.movies.getHeroImages(id)
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



    if (isLoading || !movies) return (
        <div className="h-screen w-full flex items-center justify-center">
            <p>Loading...</p>
        </div>
    )

    const BG_BASE_URL = "https://image.tmdb.org/t/p/";

    return (
        <main className="relative bg-[#1e1e1e] h-screen overflow-hidden">
            <AnimatePresence>
                {!playingVideoId && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className="absolute w-full z-40"
                    >
                        <NavBar
                            activeTab={activeTab}
                            onTabChange={setActiveTab}
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
                {activeTab === 0 && (
                    <motion.div
                        key="home"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="absolute inset-0"
                    >
                        <div className="h-screen w-full bg-cover bg-center bg-no-repeat top-0" style={{ backgroundImage: `url('${BG_BASE_URL}/original${topFilm.bg}')` }}>
                            <div className="h-full w-full px-8 py-4 bg-black/40">
                                <div className="flex items-start justify-end flex-col gap-7 h-full">
                                    <img className="object-cover w-1/3" src={`${BG_BASE_URL}/w780${topFilm.logo}`} alt="" />
                                    <p className="text-white w-2/4 text-sm">{topFilm.overview}</p>
                                    <div className="flex gap-5">
                                        <PlayButton id={topFilm.id}/>
                                        <div className="w-54 cursor-pointer h-14 rounded-2xl font-semibold text-28px gap-4 bg-linear-to-r from-[#363636] to-[#131313] flex items-center justify-center">
                                            <SFIcon icon={sfPlus} size={28} />
                                            <span>Add to List</span>
                                        </div>
                                    </div>
                                    <div className="w-full p-2.5 h-47.5 backdrop-blur-2xl rounded-[34px] flex items-center justify-around gap-7.5">
                                        {rowFilm.map((film, index) => {
                                            return (
                                                <ItemCard type="movie" key={index} index={index} item={film} />
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 1 && (
                    <motion.div
                        key="tv"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="absolute inset-0 bg-[#1e1e1e] h-screen overflow-y-auto"
                    >
                        <TVShowsPage />
                    </motion.div>
                )}

                {activeTab === 2 && (
                    <motion.div
                        key="movies"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="absolute inset-0 bg-[#1e1e1e] h-screen overflow-y-auto"
                    >
                        <MoviesPage />
                    </motion.div>
                )}

                {activeTab === 3 && (
                    <motion.div
                        key="library"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="absolute inset-0 pt-28 px-8 bg-[#1e1e1e] h-screen overflow-y-auto"
                    >
                        <h1 className="text-4xl text-white font-bold mb-8">My Library</h1>
                        <div className="w-full h-47.5 bg-zinc-800/30 rounded-[34px] flex items-center justify-center text-zinc-500 text-2xl font-semibold border-2 border-dashed border-zinc-700/50">
                            La tua lista è vuota
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    )
}

export default Dashboard