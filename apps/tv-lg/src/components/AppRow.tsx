import AppRowIcon from "./AppRowIcon"

const AppRow = () => {
    return (
        <div className="w-full p-8 min-[1920px]:p-10 max-h-66 grid grid-cols-[repeat(5,minmax(0,300px))] gap-10 min-[1920px]:gap-15 bg-[#1E1E1E]/50 rounded-[60px] justify-center">
                {/* <div className="bg-[#3A3A3C] drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)] max-w-75 max-h-45 aspect-video rounded-[30px]">
                </div>
                <div className="bg-[#3A3A3C] drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)] max-w-75 max-h-45 aspect-video rounded-[30px]">
                </div>
                <div className="bg-[#3A3A3C] drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)] max-w-75 max-h-45 aspect-video rounded-[30px]">
                </div> */}
                <AppRowIcon icon={{src: "sfTv.svg", w: 125}} from="3D3D3D" to="030303" />
                <AppRowIcon icon={{src: "sfMovieclapper.svg", w: 125}} from="19E6FF" to="1C70F2" />
                <AppRowIcon icon={{src: "sfListStar.svg", w: 125}} from="5BF776" to="0EBC29" />
                <AppRowIcon icon={{src: "AppleMusicIcon.png", w: 81, h: 104}} from="FB5976" to="FA243B" />
                <AppRowIcon icon={{src: "Symbols_8_.png", w: 125}} from="D0D4DA" to="8B8F93" />
            </div>
    )
}

export default AppRow