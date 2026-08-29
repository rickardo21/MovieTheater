import SFIcon from "@bradleyhodges/sfsymbols-react"
import { sfPlayFill } from "@bradleyhodges/sfsymbols";
import { usePopupManager } from "../../../../apps/web/src/store/PopupContext";


export const PlayButton = ({ id }: { id: number }) => {

    const { playVideo, closePopup } = usePopupManager();

    const handlePlay = () => {
        playVideo(id);
        // Optionally close the popup if you want it to disappear under the video player
        closePopup();
    };

    return (

        <div onClick={handlePlay} className="w-54 cursor-pointer text-[20px] h-14 rounded-2xl font-semibold gap-4 bg-linear-to-r from-[#ff484b] to-[#ff1e1e] flex items-center justify-center">
            <SFIcon icon={sfPlayFill} size={28} />
            <span>Watch Now</span>
        </div>

    )
}

export default PlayButton