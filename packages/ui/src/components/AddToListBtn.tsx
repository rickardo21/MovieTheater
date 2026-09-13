import React from "react";
import { sfPlus, sfCheckmark } from "@bradleyhodges/sfsymbols";
import SFIcon from "@bradleyhodges/sfsymbols-react";
import { useAuth } from "../../../../apps/web/src/store/AuthContext";

interface AddToListBtnProps {
    id: string | number;
    type?: "movie" | "tv";
    item?: any;
}

export const AddToListBtn: React.FC<AddToListBtnProps> = ({ id, type = "movie", item }) => {
    const { addToLibrary, removeFromLibrary, isInLibrary } = useAuth();
    const inList = isInLibrary(id);

    const handleClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            if (inList) {
                await removeFromLibrary(id);
            } else {
                const itemData = item || { id, type };
                await addToLibrary(itemData, type);
            }
        } catch (err) {
            console.error("Errore aggiornamento libreria:", err);
        }
    };

    return (
        <div
            onClick={handleClick}
            className={`w-54 cursor-pointer text-[20px] h-14 rounded-2xl font-semibold gap-4 flex items-center justify-center text-white transition-all bg-linear-to-r from-[#363636] to-[#131313] hover:brightness-125`}
        >
            <SFIcon icon={inList ? sfCheckmark : sfPlus} size={28} />
            <span>{inList ? "Added to List" : "Add to List"}</span>
        </div>
    );
};

export default AddToListBtn;