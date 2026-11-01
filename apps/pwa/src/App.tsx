import { useEffect } from "react";
import { App as F7App, Views, View, Toolbar, Link } from "framework7-react";
import type { Framework7Parameters } from "framework7/types";
import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import LibraryPage from "./pages/LibraryPage";
import ProfilePage from "./pages/ProfilePage";
import DetailPage from "./pages/DetailPage";
import WatchPage from "./pages/WatchPage";

const f7params: Framework7Parameters = {
  name: "MovieTheater",
  theme: "ios",
  routes: [
    { path: "/", component: HomePage },
    { path: "/search/", component: SearchPage },
    { path: "/library/", component: LibraryPage },
    { path: "/profile/", component: ProfilePage },
    { path: "/detail/:type/:id/", component: DetailPage },
    { path: "/watch/:type/:id/:season/:episode/", component: WatchPage },
    { path: "/watch/:type/:id/", component: WatchPage },
  ],
};

export default function App() {
  // Tema scuro fisso, come nelle app Apple TV
  useEffect(() => {
    document.documentElement.classList.add("theme-dark");
  }, []);

  return (
    <F7App {...f7params}>
      <Views tabs className="safe-areas">
        <Toolbar tabbar bottom className="tabbar-labels">
          <Link tabLink="#view-home" tabLinkActive iconF7="house_fill" text="Inizio" />
          <Link tabLink="#view-search" iconF7="magnifyingglass" text="Cerca" />
          <Link tabLink="#view-library" iconF7="rectangle_stack_fill" text="Libreria" />
          <Link tabLink="#view-profile" iconF7="person_crop_circle" text="Profilo" />
        </Toolbar>

        <View id="view-home" main tab tabActive url="/" iosDynamicNavbar={false} />
        <View id="view-search" tab url="/search/" />
        <View id="view-library" tab url="/library/" />
        <View id="view-profile" tab url="/profile/" />
      </Views>
    </F7App>
  );
}
