import { App as F7App, View } from "framework7-react";
import MainPage from "./pages/MainPage";
import DetailPage from "./pages/DetailPage";
import WatchPage from "./pages/WatchPage";

const f7params = {
  name: "MovieTheater",
  theme: "ios" as const,
  routes: [
    { path: "/", component: MainPage },
    { path: "/detail/:type/:id/", component: DetailPage },
    { path: "/watch/:type/:id/", component: WatchPage },
    { path: "/watch/:type/:id/:season/:episode/", component: WatchPage },
  ],
};

export default function App() {
  return (
    <F7App {...f7params}>
      <View main url="/" />
    </F7App>
  );
}
