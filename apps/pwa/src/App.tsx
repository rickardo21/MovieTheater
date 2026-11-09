import { App as F7App, Views, View, Toolbar, ToolbarPane, Link } from "framework7-react";
import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import LibraryPage from "./pages/LibraryPage";
import DetailPage from "./pages/DetailPage";

// Aspetto chiaro/scuro: segue l'impostazione del telefono (HIG › Dark Mode), nessun interruttore nell'app
const f7params = {
  name: "MovieTheater",
  theme: "ios" as const,
  routes: [
    { path: "/", component: HomePage },
    { path: "/search/", component: SearchPage },
    { path: "/library/", component: LibraryPage },
    { path: "/detail/:type/:id/", component: DetailPage },
  ],
};

// Ogni scheda ha la sua vista: titolo grande, navigazione e gesto "indietro" restano separati
export default function App() {
  return (
    <F7App {...f7params}>
      <Views tabs className="safe-areas">
        <Toolbar tabbar icons bottom>
          <ToolbarPane>
            <Link tabLink="#view-home" tabLinkActive text="Inizio" iconIos="f7:house_fill" iconMd="material:home" />
            <Link tabLink="#view-search" text="Cerca" iconIos="f7:search" iconMd="material:search" />
            <Link tabLink="#view-library" text="Libreria" iconIos="f7:rectangle_stack_fill" iconMd="material:video_library" />
          </ToolbarPane>
        </Toolbar>

        <View id="view-home" main tab tabActive url="/" />
        <View id="view-search" tab url="/search/" />
        <View id="view-library" tab url="/library/" />
      </Views>
    </F7App>
  );
}
