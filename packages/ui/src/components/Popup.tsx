import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import SFIcon from "@bradleyhodges/sfsymbols-react";
import { sfXmark } from "@bradleyhodges/sfsymbols";

// ─── Types ───────────────────────────────────────────────────────────────────

export type PopupPosition =
    | "center"
    | "top-left"
    | "top-center"
    | "top-right"
    | "bottom-left"
    | "bottom-center"
    | "bottom-right"
    | { x: number; y: number };  // pixel offset from top-left

export type PopupSize =
    | "sm"     // 360 x auto
    | "md"     // 520 x auto
    | "lg"     // 720 x auto
    | "xl"     // 960 x auto
    | "full"   // 100% x 100%
    | { width: number | string; height: number | string };

export interface PopupAction {
    label: string;
    onClick: () => void;
    variant?: "primary" | "secondary" | "danger" | "ghost";
}

export interface PopupProps {
    /** Controls visibility */
    isOpen: boolean;
    /** Called when the user requests to close */
    onClose: () => void;

    // ── Content ──────────────────────────────────────────────────────────────
    title?: string;
    subtitle?: string;
    children?: ReactNode;
    /** Bottom action buttons */
    actions?: PopupAction[];

    // ── Layout ───────────────────────────────────────────────────────────────
    size?: PopupSize;
    position?: PopupPosition;

    // ── Behaviour ────────────────────────────────────────────────────────────
    /** Close when clicking the backdrop */
    closeOnBackdrop?: boolean;
    /** Show the × close button */
    showCloseButton?: boolean;
    /** Dim/blur the page behind the popup */
    backdrop?: boolean;
    /** Extra class for the inner panel */
    className?: string;
    backgroundImage?: string;
    logoImage?: string;
    /** Optional ref forwarded to the scrollable body container */
    scrollContainerRef?: React.RefObject<HTMLDivElement>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const SIZE_MAP: Record<string, { width: number | string; height: number | string }> = {
    sm: { width: 360, height: "auto" },
    md: { width: 520, height: "auto" },
    lg: { width: 720, height: "auto" },
    xl: { width: 960, height: "auto" },
    full: { width: "100%", height: "100%" },
};

function resolveSize(size: PopupSize = "md"): { width: number | string; height: number | string } {
    if (typeof size === "string") return SIZE_MAP[size];
    return size;
}

/**
 * Returns the className for the fixed wrapper div that handles positioning.
 * framer-motion animates only scale/y inside this wrapper, no CSS transform conflict.
 */
function resolveWrapperStyle(position: PopupPosition = "center"): React.CSSProperties {
    // Custom pixel position — wrapper at top-left, panel offset via top/left
    if (typeof position === "object" && "x" in position) {
        return {
            position: "fixed",
            top: position.y,
            left: position.x,
        };
    }

    const base: React.CSSProperties = { position: "fixed" };

    const map: Record<string, React.CSSProperties> = {
        "center": {
            ...base,
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
        },
        "top-left": {
            ...base,
            top: 24,
            left: 24,
        },
        "top-center": {
            ...base,
            top: 24,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
        },
        "top-right": {
            ...base,
            top: 24,
            right: 24,
        },
        "bottom-left": {
            ...base,
            bottom: 24,
            left: 24,
        },
        "bottom-center": {
            ...base,
            bottom: 24,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
        },
        "bottom-right": {
            ...base,
            bottom: 24,
            right: 24,
        },
    };

    return map[position as string] ?? map["center"];
}

const ACTION_STYLES: Record<string, string> = {
    primary: "bg-gradient-to-r from-[#ff484b] to-[#ff1e1e] text-white hover:brightness-110",
    secondary: "bg-white/10 text-white/90 hover:bg-white/20",
    danger: "bg-gradient-to-r from-red-700 to-red-900 text-white hover:brightness-110",
    ghost: "text-white/60 hover:text-white hover:bg-white/5",
};

// ─── Component ───────────────────────────────────────────────────────────────

export const Popup = ({
    isOpen,
    onClose,
    title,
    subtitle,
    children,
    actions = [],
    size = "md",
    position = "center",
    closeOnBackdrop = true,
    showCloseButton = true,
    backdrop = true,
    backgroundImage,
    logoImage,
    className = "",
    scrollContainerRef,
}: PopupProps) => {
    const { width, height } = resolveSize(size);
    const wrapperStyle = resolveWrapperStyle(position);

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isOpen, onClose]);

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* ── Backdrop ────────────────────────────────────────── */}
                    {backdrop && (
                        <motion.div
                            key="popup-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 z-3000 bg-black/60 backdrop-blur-sm"
                            onClick={closeOnBackdrop ? onClose : undefined}
                        />
                    )}

                    {/*
                     * ── Positioning wrapper ──────────────────────────────────
                     * Portaled to document.body → immune to any ancestor
                     * backdrop-filter / transform / overflow containing block.
                     */}
                    <div style={{ ...wrapperStyle, zIndex: 3100 }} onClick={(e) => e.stopPropagation()}>
                        <motion.div
                            key="popup-panel"
                            initial={{ opacity: 0, scale: 0.92, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: 16 }}
                            transition={{ type: "spring", bounce: 0.22, duration: 0.4 }}
                            style={{ width, height, maxHeight: "90vh", overflowY: "auto" }}
                            className={[
                                "flex flex-col rounded-[28px] bg-cover bg-center bg-no-repeat",
                                "shadow-[0_24px_80px_rgba(0,0,0,0.7)] bg-[#1e1e1e]",
                                "backdrop-blur-2xl",
                                "border border-white/10",
                                className,
                            ].join(" ")}
                        >
                            {/* {backgroundImage && logoImage && (
                                <div>
                                    <div
                                        style={{ backgroundImage: `url('${backgroundImage}')` }}
                                        className="absolute top-0 left-0 h-87.5 w-full bg-cover bg-center bg-no-repeat"
                                    >
                                    </div>
                                    <div className="w-full h-87.5 bg-linear-to-b from-transparent to-[#1e1e1e] absolute top-0 left-0" />
                                </div>
                            )} */}
                            {/* ── Header ──────────────────────────────────── */}
                            {/* {(title || showCloseButton) && (
                                <div className="flex items-start justify-between px-6 pt-6 pb-4">
                                    <div className="flex flex-col gap-1">
                                        {title && (
                                            <h2 className="text-white text-xl font-semibold leading-snug">
                                                {title}
                                            </h2>
                                        )}
                                        {subtitle && (
                                            <p className="text-white/50 text-sm leading-snug">
                                                {subtitle}
                                            </p>
                                        )}
                                    </div>

                                    {showCloseButton && (
                                        <div onClick={onClose} className="backdrop-blur-2xl bg-[#1b1b1b] shadow-[0_3px_10px_rgb(0,0,0,0.2)] w-10 transition-all duration-300 rounded-full absolute right-4 flex items-center justify-center top-4 h-10 ">
                                            <SFIcon icon={sfXmark} size={14} className="cursor-pointer text-white" />
                                        </div>
                                    )}
                                </div>
                            )} */}

                            {/* ── Body ────────────────────────────────────── */}
                            {children && (
                                <div ref={scrollContainerRef} className="flex-1 overflow-y-auto z-3000 text-white/80 text-sm leading-relaxed">
                                    {children}
                                </div>
                            )}

                            {/* ── Footer actions ──────────────────────────── */}
                            {actions.length > 0 && (
                                <>
                                    <div className="h-px bg-white/[0.07] mx-6" />
                                    <div className="flex items-center justify-end gap-3 px-6 py-4">
                                        {actions.map((action, i) => (
                                            <button
                                                key={i}
                                                onClick={action.onClick}
                                                className={[
                                                    "px-5 py-2 rounded-[14px] text-sm font-semibold",
                                                    "transition-all duration-200 cursor-pointer",
                                                    ACTION_STYLES[action.variant ?? "secondary"],
                                                ].join(" ")}
                                            >
                                                {action.label}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default Popup;
