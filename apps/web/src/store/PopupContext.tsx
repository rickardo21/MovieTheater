import { createContext, useContext, useState, type ReactNode } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface PopupManagerContextValue {
    /** L'oggetto attualmente aperto nel popup, null se nessuno */
    activeItem: any | null;
    /** Il tipo di elemento aperto */
    activeType: "movie" | "tv" | null;
    /** Apre il popup per un dato elemento */
    openPopup: (item: any, type: "movie" | "tv") => void;
    /** Chiude qualsiasi popup aperto */
    closePopup: () => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const PopupManagerContext = createContext<PopupManagerContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export const PopupProvider = ({ children }: { children: ReactNode }) => {
    const [activeItem, setActiveItem] = useState<any | null>(null);
    const [activeType, setActiveType] = useState<"movie" | "tv" | null>(null);

    const openPopup = (item: any, type: "movie" | "tv") => {
        setActiveItem(item);
        setActiveType(type);
    };
    
    const closePopup = () => {
        setActiveItem(null);
        setActiveType(null);
    };

    return (
        <PopupManagerContext.Provider value={{ activeItem, activeType, openPopup, closePopup }}>
            {children}
        </PopupManagerContext.Provider>
    );
};

// ─── Hook ────────────────────────────────────────────────────────────────────

export const usePopupManager = (): PopupManagerContextValue => {
    const ctx = useContext(PopupManagerContext);
    if (!ctx) {
        throw new Error("usePopupManager must be used inside <PopupProvider>");
    }
    return ctx;
};
