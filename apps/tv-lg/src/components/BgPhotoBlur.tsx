interface BgPhotoBlurProps {
    imgSrc: string;
}

const BgPhotoBlur: React.FC<BgPhotoBlurProps> = ({
    imgSrc
}) => {
    return (
        <div className="absolute top-0 left-0 w-screen h-screen" style={{
            background: `url(${imgSrc}) center / cover no-repeat`,
            zIndex: -1,
        }}></div>
    )
}

export default BgPhotoBlur