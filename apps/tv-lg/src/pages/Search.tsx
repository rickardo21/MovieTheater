import SFIcon from "@bradleyhodges/sfsymbols-react";
import { sfMagnifyingglass } from "@bradleyhodges/sfsymbols";
import { sfNumbers } from "@bradleyhodges/sfsymbols";
import { sfDeleteBackwardFill } from "@bradleyhodges/sfsymbols";

import { useState } from "react";

import BgPhotoBlur from "../components/BgPhotoBlur";

const Search = () => {

    const [searchFieldValue, setSearchFieldValue] = useState("");
    const [showNumbers, setShowNumbers] = useState(false);

    const letter = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"]
    const numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "@", "!", "?", ".", ",", "-", "_", " "]

    return (
        <main className="h-screen flex flex-col z-100 justify-between w-full px-11.75 py-12.5">

            <BgPhotoBlur imgSrc="/image%2019.png" />

            <div className="flex flex-col gap-10">
                <div className="flex items-center gap-7 ">
                    <SFIcon icon={sfMagnifyingglass} color="#FFFFFF" className="w-12 h-12" />
                    <input
                        type="text"
                        placeholder="Search"
                        value={searchFieldValue}
                        onChange={(e) => setSearchFieldValue(e.target.value)}
                        className="focus:border-none font-medium focus:outline-none text-[50px]"
                    />
                </div>

                <div className="flex gap-14 items-center px-8">
                    <div className="flex gap-4">
                        <div onClick={() => setShowNumbers(!showNumbers)} className="w-17.5 uppercase text-lg font-medium text-black cursor-pointer bg-white/50 flex justify-center items-center h-9.5 rounded-[7px]">
                            {showNumbers ? "ABC" : "123"}
                        </div>
                        <div onClick={() => setSearchFieldValue(searchFieldValue + " ")} className="w-22.25 cursor-pointer uppercase text-lg font-medium text-black bg-white/50 flex justify-center items-center h-9.5 rounded-[7px]">
                            space
                        </div>
                    </div>
                    <div className="gap-1 flex-1 flex items-center text-white/50 justify-between">
                        {
                            [...(showNumbers ? numbers : letter)].map((letter, idx) => {
                                return (
                                    <div key={idx} onClick={() => setSearchFieldValue(searchFieldValue + letter)} className="text-4xl cursor-pointer font-medium flex justify-center items-center">
                                        {letter}
                                    </div>
                                )
                            })
                        }
                    </div>
                    <SFIcon onClick={() => setSearchFieldValue(searchFieldValue.slice(0, -1))} icon={sfDeleteBackwardFill} color="#FFFFFF" className="h-10 cursor-pointer w-10 opacity-50" />
                </div>
            </div>

        </main>
    )
}

export default Search;