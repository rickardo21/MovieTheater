import AppRow from "../components/AppRow";
import AvatarComp from "../components/AvatarComp";
import BgPhotoBlur from "../components/BgPhotoBlur";
import PosterItem from "../components/PosterItem";
import { Link } from "react-router-dom";

const Home = () => {

    return (
        <main className="h-screen flex flex-col z-100 justify-between w-full px-11.75 py-12.5">

            <BgPhotoBlur imgSrc="/james-butterly-SUNFNB7Dy24-unsplash%201.png"/>

            <div className="w-full flex items-center justify-between">
                <div>
                    <div className="font-semibold text-6xl">Continue Watching</div>
                </div>
                <AvatarComp />
            </div>

            <div className="flex-1 flex justify-start gap-11 items-center w-full">
                <PosterItem imgSrc="https://image.tmdb.org/t/p/original/1E5baAaEse26fej7uHcjOgEE2t2.jpg" progress={30} />
                <PosterItem imgSrc="https://image.tmdb.org/t/p/original/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg" progress={10} />
                <PosterItem imgSrc="https://image.tmdb.org/t/p/original/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg" progress={90} />
                <Link to="/search">
                    <PosterItem imgSrc="https://image.tmdb.org/t/p/original/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg" progress={90} />
                </Link>
            </div>

            <AppRow />

        </main>
    )
}

export default Home;