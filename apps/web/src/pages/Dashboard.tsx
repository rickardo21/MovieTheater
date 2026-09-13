import { NavBar } from "@movietheater/ui/src/components/NavBar"
import { ItemCard } from "@movietheater/ui/src/components/ItemCard"
import { motion, AnimatePresence } from "framer-motion";
import { useNavBar } from "../store/NavBarContext";
import { usePlayerManager } from "../store/PlayerContext";
import { useAuth } from "../store/AuthContext";
import TVShowsPage from "./TVShowsPage";
import MoviesPage from "./MoviesPage";
import { HomeTab } from "./HomeTab";

const BG_BASE_URL = "https://image.tmdb.org/t/p/";

const Dashboard = () => {
    const { activeTab, setActiveTab, searchQuery, setSearchQuery } = useNavBar();
    const { playingVideo, playVideo } = usePlayerManager();
    const { library, watchHistory } = useAuth();

    const formatProgressTime = (sec: number) => {
        if (!sec || isNaN(sec)) return "0:00";
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return `${m}:${String(s).padStart(2, "0")}`;
    };

    return (
        <main className="relative bg-[#1e1e1e] h-screen overflow-hidden">
            <AnimatePresence>
                {!playingVideo && (
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
                        <HomeTab />
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
                        className="absolute inset-0 pt-28 px-8 bg-[#1e1e1e] h-screen overflow-y-auto pb-12"
                    >
                        {/* Section 1: Continua a guardare (Watch History) */}
                        {watchHistory && watchHistory.length > 0 && (
                            <div className="mb-10">
                                <h2 className="text-2xl text-white font-bold mb-4">Continua a guardare</h2>
                                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                                    {watchHistory.map((item, index) => {
                                        const progressPercent = item.durationSeconds > 0 
                                            ? Math.min(100, Math.round((item.progressSeconds / item.durationSeconds) * 100)) 
                                            : 0;

                                        return (
                                            <div
                                                key={`hist-${item.id}-${index}`}
                                                onClick={() => {
                                                    playVideo({
                                                        type: item.type,
                                                        id: Number(item.id),
                                                        title: item.title,
                                                        season: item.season || 1,
                                                        episode: item.episode || 1,
                                                        episodeTitle: item.episodeTitle,
                                                        item: item
                                                    } as any);
                                                }}
                                                className="shrink-0 w-64 h-40 bg-zinc-900 rounded-[24px] overflow-hidden relative border border-white/10 cursor-pointer group hover:scale-105 transition-transform"
                                                style={{
                                                    backgroundImage: item.bg ? `url('${BG_BASE_URL}w500${item.bg}')` : undefined,
                                                    backgroundSize: "cover",
                                                    backgroundPosition: "center"
                                                }}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-4 flex flex-col justify-end">
                                                    <span className="text-white text-sm font-bold truncate">{item.title}</span>
                                                    {item.type === "tv" && (
                                                        <span className="text-white/60 text-xs">S{item.season || 1} E{item.episode || 1}</span>
                                                    )}
                                                    <div className="w-full h-1.5 bg-white/20 rounded-full mt-2 overflow-hidden">
                                                        <div 
                                                            className="h-full bg-red-500 rounded-full" 
                                                            style={{ width: `${progressPercent}%` }} 
                                                        />
                                                    </div>
                                                    <span className="text-white/40 text-[10px] mt-1">
                                                        {formatProgressTime(item.progressSeconds)} / {formatProgressTime(item.durationSeconds)} ({progressPercent}%)
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Section 2: La mia lista (Library) */}
                        <h1 className="text-3xl text-white font-bold mb-6">La Mia Libreria</h1>
                        {library && library.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {library.map((item, index) => (
                                    <ItemCard
                                        key={`lib-${item.id}-${index}`}
                                        index={index}
                                        item={item}
                                        type={item.type}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="w-full h-47.5 bg-zinc-800/30 rounded-[34px] flex items-center justify-center text-zinc-500 text-2xl font-semibold border-2 border-dashed border-zinc-700/50">
                                La tua lista è vuota
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    )
}

export default Dashboard