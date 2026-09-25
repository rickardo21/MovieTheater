import { Navigate, Route, Routes } from "react-router-dom";

import Home from "../pages/Home";
import Search from "../pages/Search";
import Player from "../pages/Player";
import DeepView from "../pages/DeepView";

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/player/:id" element={<Player />} />
            <Route path="/deepview/:showType/:id" element={<DeepView />} />

            {/* Pagina mostrata per route inesistenti */}
            <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
    );
}