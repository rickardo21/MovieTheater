import { sfGear, sfMagnifyingglass, sfTv, sfFilm } from "@bradleyhodges/sfsymbols";
import SFIcon from "@bradleyhodges/sfsymbols-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { IconDefinition } from "@bradleyhodges/sfsymbols-types";
import QRCode from "react-qr-code";
import { Popup } from "./Popup";
import { useAuth } from "../../../../apps/web/src/store/AuthContext";

type ItemsType = {
    label: string,
    icon?: IconDefinition
}

export interface NavBarProps {
    activeTab?: number;
    onTabChange?: (index: number) => void;
    searchQuery?: string;
    onSearchChange?: (query: string) => void;
}

export const NavBar = ({ activeTab, onTabChange, searchQuery, onSearchChange }: NavBarProps = {}) => {
    const { logout, userProfile, userSettings, updateSettings } = useAuth();

    const items: ItemsType[] = [
        {
            label: "Home"
        },
        {
            label: "TV Shows",
            icon: sfTv
        },
        {
            label: "Movies",
            icon: sfFilm
        },
        {
            label: "Library"
        }
    ]

    const [internalActive, setInternalActive] = useState<number>(0)
    const active = activeTab !== undefined ? activeTab : internalActive;

    const handleSetActive = (index: number) => {
        setInternalActive(index);
        if (onTabChange) onTabChange(index);
    }

    const [isMinimaze, setIsMinimaze] = useState<boolean>(false)
    const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false)
    const [showRemoteQr, setShowRemoteQr] = useState<boolean>(false)

    const remotePairingUrl = `${window.location.origin}/remote-pair?uid=${userProfile?.uid || 'guest'}&session=${Date.now()}`;

    const handleLogout = async () => {
        try {
            setIsSettingsOpen(false);
            await logout();
        } catch (err) {
            console.error("Errore durante il logout:", err);
        }
    };

    return (
        <div className="flex items-center z-2000 justify-center px-20 h-10 w-full fixed top-4 left-0">
            <AnimatePresence mode="wait">
                {isMinimaze ? (
                    <motion.div
                        key="minimaze"
                        className="w-160 flex gap-5"
                    >
                        <motion.div
                            layoutId="nav-icon"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.3 }}
                            className="w-10 shadow-[0_3px_10px_rgb(0,0,0,0.2)] h-10 rounded-[18px] flex font-semibold items-center backdrop-blur-2xl text-[28px] cursor-pointer"
                        >
                            <div
                                onClick={() => setIsMinimaze(false)}
                                className={`flex h-full flex-1 items-center justify-center rounded-[18px] whitespace-nowrap`}
                            >
                                {items[active]?.icon ? (
                                    <SFIcon icon={items[active].icon as IconDefinition} size={24} />
                                ) : (
                                    <SFIcon icon={sfTv} size={24} />
                                )}
                            </div>
                        </motion.div>

                        <motion.div
                            layoutId="nav-main"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            style={{ width: `calc(640px - 60px)` }}
                            className="shadow-[0_3px_10px_rgb(0,0,0,0.2)] h-10 rounded-[18px] flex px-4 font-semibold items-center backdrop-blur-2xl text-[28px] overflow-hidden"
                        >
                            <SFIcon icon={sfMagnifyingglass} size={20} />
                            <input 
                                type="text" 
                                className="w-full h-full bg-transparent outline-none px-4 text-lg text-white" 
                                placeholder="Search..." 
                                value={searchQuery || ''}
                                onChange={(e) => onSearchChange?.(e.target.value)}
                            />
                        </motion.div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="maximaze"
                        layoutId="nav-main"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        className="w-160 shadow-[0_3px_10px_rgb(0,0,0,0.2)] h-10 rounded-[18px] flex font-semibold items-center backdrop-blur-2xl text-[28px] overflow-hidden"
                    >
                        {items.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 + 0.1 }}
                                onClick={() => {
                                    handleSetActive(index);
                                    if (index != 0 && index != 3) setIsMinimaze(true);
                                }}
                                className={`relative flex h-full flex-1 items-center justify-center text-[24px] cursor-pointer rounded-[18px] whitespace-nowrap transition-colors ${index === active ? "text-black font-bold" : "text-white/90"}`}
                            >
                                {index === active && (
                                    <motion.div
                                        layoutId="active-tab"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        className="absolute inset-0 bg-white rounded-[18px] z-0"
                                    />
                                )}
                                <span className="relative z-10">{item.label}</span>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
            {
                !isMinimaze && (
                    <div
                        onClick={() => setIsSettingsOpen(true)}
                        className="backdrop-blur-2xl bg-[#1b1b1b] shadow-[0_3px_10px_rgb(0,0,0,0.2)] w-10 transition-all duration-300 rounded-full absolute right-8 flex items-center justify-center top-0 h-10 cursor-pointer hover:bg-white/10"
                    >
                        <SFIcon icon={sfGear} size={20} className="text-white" />
                    </div>
                )
            }

            {/* ── Settings Popup ─────────────────────────────────────── */}
            <Popup
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                size="sm"
                position="center"
                closeOnBackdrop
                backdrop
            >
                <div className="px-6 py-6 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-white text-lg font-semibold">Impostazioni</h2>
                        <button
                            onClick={() => setIsSettingsOpen(false)}
                            className="text-white/50 hover:text-white text-sm transition-colors cursor-pointer"
                        >
                            ✕
                        </button>
                    </div>

                    {userProfile?.displayName || userProfile?.email ? (
                        <div className="flex flex-col bg-white/5 p-3 rounded-xl border border-white/10">
                            <span className="text-white text-sm font-semibold">{userProfile.displayName || 'Utente'}</span>
                            <span className="text-white/40 text-xs">{userProfile.email}</span>
                        </div>
                    ) : null}

                    <div className="h-px bg-white/10" />

                    {/* Sezione tema */}
                    <div className="flex flex-col gap-2">
                        <p className="text-white/50 text-xs uppercase tracking-widest">Tema</p>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => updateSettings({ theme: 'dark' })}
                                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                                    userSettings.theme === 'dark' ? 'bg-white/20 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'
                                }`}
                            >
                                🌙 Scuro
                            </button>
                            <button 
                                onClick={() => updateSettings({ theme: 'light' })}
                                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                                    userSettings.theme === 'light' ? 'bg-white/20 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'
                                }`}
                            >
                                ☀️ Chiaro
                            </button>
                        </div>
                    </div>

                    <div className="h-px bg-white/10" />

                    {/* Sezione lingua */}
                    <div className="flex flex-col gap-2">
                        <p className="text-white/50 text-xs uppercase tracking-widest">Lingua</p>
                        <select 
                            value={userSettings.language}
                            onChange={(e) => updateSettings({ language: e.target.value })}
                            className="bg-white/10 text-white text-sm rounded-xl px-3 py-2 outline-none border border-white/10 cursor-pointer"
                        >
                            <option value="it" className="bg-[#1b1b1b]">🇮🇹 Italiano</option>
                            <option value="en" className="bg-[#1b1b1b]">🇬🇧 English</option>
                        </select>
                    </div>

                    <div className="h-px bg-white/10" />

                    {/* Sezione qualità */}
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-white text-sm font-medium">Qualità automatica</span>
                            <span className="text-white/40 text-xs">Adatta la qualità alla connessione</span>
                        </div>
                        <div 
                            onClick={() => updateSettings({ autoplay: !userSettings.autoplay })}
                            className={`w-10 h-6 rounded-full flex items-center cursor-pointer transition-colors ${
                                userSettings.autoplay ? 'bg-emerald-500' : 'bg-white/20'
                            }`}
                        >
                            <div className={`w-4 h-4 rounded-full bg-white transition-all ${
                                userSettings.autoplay ? 'ml-5' : 'ml-1'
                            }`} />
                        </div>
                    </div>

                    <div className="h-px bg-white/10" />

                    {/* Sezione Telecomando QR Code */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-white text-sm font-medium">Associa Telecomando</span>
                                <span className="text-white/40 text-xs">QR code per app telecomando</span>
                            </div>
                            <button
                                onClick={() => setShowRemoteQr(!showRemoteQr)}
                                className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer"
                            >
                                {showRemoteQr ? 'Nascondi QR' : 'Mostra QR'}
                            </button>
                        </div>

                        {showRemoteQr && (
                            <div className="flex flex-col items-center p-3 bg-white rounded-2xl mt-1">
                                <QRCode value={remotePairingUrl} size={130} />
                                <span className="text-black/60 text-[10px] font-semibold mt-2 text-center">
                                    Scansiona dall'app telecomando
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="h-px bg-white/10" />

                    {/* ── Logout Button ── */}
                    <button
                        onClick={handleLogout}
                        className="w-full py-2.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 mt-1"
                    >
                        <span>Disconnetti (Logout)</span>
                    </button>
                </div>
            </Popup>
        </div>
    );
};

export default NavBar;