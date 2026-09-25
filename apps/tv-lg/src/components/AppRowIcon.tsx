interface AppRowIconProps {
    icon: {
        src: string;
        w: number;
        h?: number;
    };
    from: string;
    to: string;
}

const AppRowIcon: React.FC<AppRowIconProps> = ({
    icon,
    from,
    to
}) => {
    return (
        <div
            style={{ background: `linear-gradient(to bottom, #${from}, #${to})` }}
            className="cursor-pointer flex items-center justify-center drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)] max-w-75 max-h-45 aspect-video rounded-[30px]"
        >
            <img
                style={{ width: `${icon.w}px`, height: `${icon.h ?? icon.w}px`, color: "#FFF"}}
                className="max-[1920px]:scale-80"
                src={`/${icon.src}`}
                alt=""
            />
        </div>
    )
}

export default AppRowIcon