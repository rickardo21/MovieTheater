const AvatarComp = () => {

    const dateTime = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <div className="bg-[#1E1E1E]/50 backdrop-blur-[50px] border-white/40 w-[clamp(185.6px,12.08vw,232px)] h-[clamp(70.4px,4.58vw,88px)] rounded-[50px] grid items-center grid-cols-[1fr_clamp(70.4px,4.58vw,88px)]">
            <div className="font-medium text-center text-[1.675rem]">{dateTime}</div>
            <div className="w-[clamp(56px,3.64vw,70px)] h-[clamp(56px,3.64vw,70px)] mx-auto rounded-full bg-[url(/avatar.png)] bg-cover bg-center "></div>
        </div>
    )
}

export default AvatarComp