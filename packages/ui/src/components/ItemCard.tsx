import React from "react";
import { usePopupManager } from "../../../../apps/web/src/store/PopupContext";

interface ItemCardProps {
    index: number;
    item?: any;
    type: "movie" | "tv";
    skeleton?: boolean;
}

export const ItemCard: React.FC<ItemCardProps> = ({
    index,
    item,
    type,
    skeleton = false
}) => {

    const BG_BASE_URL = "https://image.tmdb.org/t/p/";
    const { openPopup } = usePopupManager();

    return (
        <>
            {skeleton || !item ? (
                <div key={index} className="w-62.5 h-47.5 cursor-pointer rounded-[28px] flex items-center px-5 bg-cover bg-center bg-no-repeat shrink-0 bg-[#181818] animate-pulse" />
            ) : (
                <div 
                    onClick={() => openPopup(item, type)} 
                    key={index} 
                    className="w-62.5 h-47.5 cursor-pointer rounded-[28px] flex items-center px-5 bg-cover bg-center bg-no-repeat shrink-0" 
                    style={{ backgroundImage: `url('${BG_BASE_URL}/w500${item.bg}')` }} 
                >
                    <img className="object-contain" src={`${BG_BASE_URL}/w780${item.logo}`} alt="" />
                </div>
            )}
        </>
    )
}

export default ItemCard;