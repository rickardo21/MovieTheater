import { sfGear, sfMagnifyingglass, sfTv, sfFilm, sfXmark } from "@bradleyhodges/sfsymbols";
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
                            className="w-10 shadow-[0_3px_10px_rgb(0,0,0,0.2)] h-10 rounded-[26px] flex font-semibold items-center backdrop-blur-2xl text-[28px] cursor-pointer"
                        >
                            <div
                                onClick={() => setIsMinimaze(false)}
                                className={`flex h-full flex-1 items-center justify-center rounded-[26px] whitespace-nowrap`}
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
                        className="w-160 shadow-[0_3px_10px_rgb(0,0,0,0.2)] h-10 rounded-[26px] flex items-center backdrop-blur-2xl text-[28px] overflow-hidden"
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
                                className={`relative flex h-full flex-1 items-center justify-center text-[26px] cursor-pointer rounded-[26px] font-semibold whitespace-nowrap transition-colors ${index === active ? "text-black" : "text-white/90"}`}
                            >
                                {index === active && (
                                    <motion.div
                                        layoutId="active-tab"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        className="absolute inset-0 bg-white rounded-[26px] z-0"
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
                size="md"
                position="center"
                closeOnBackdrop
                backdrop
            >
                <div className="px-6 py-6 flex flex-col">
                    <div
                        onClick={() => setIsSettingsOpen(false)}
                        className="backdrop-blur-2xl ml-auto cursor-pointer shadow-[0_3px_10px_rgb(0,0,0,0.2)] w-10 transition-all duration-300 rounded-full flex items-center justify-center h-10 "
                    >
                        <SFIcon
                            icon={sfXmark}
                            size={14}
                            className="cursor-pointer text-white"
                        />
                    </div>

                    ciao
                    
                </div>
            </Popup>
        </div>
    );
};

export default NavBar;