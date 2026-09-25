
interface PosterItemProps {
    imgSrc: string;
    progress: number
}

const PosterItem:React.FC<PosterItemProps> = ({
    imgSrc,
    progress
}) => {
    return (
        <div style={{
            background: `url(${imgSrc}) center center / cover`,
            backgroundRepeat: "no-repeat"
        }} className="cursor-pointer w-[clamp(280px,18.2vw,351px)] flex items-end px-5 py-7.5 rounded-[30px] h-[clamp(421px,27.4vw,527px)]">

            <div className="rounded-[30px] h-2.25 w-full backdrop-blur-[11.5px]">
                <div style={{
                    width: `${progress}%`
                }} className="rounded-[30px] h-full bg-white"></div>
            </div>
        </div>
    )
}

export default PosterItem