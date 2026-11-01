import { Page, Toolbar, Link, Tabs, Tab } from "framework7-react";
import HomeTab from "../tabs/HomeTab";
import SearchTab from "../tabs/SearchTab";
import LibraryTab from "../tabs/LibraryTab";
import ProfileTab from "../tabs/ProfileTab";

// Schermata principale: tabbar in basso e un contenuto per ogni tab
export default function MainPage() {
  return (
    <Page pageContent={false}>
      <Toolbar tabbar icons bottom>
          <Link tabLink="#tab-home" tabLinkActive text="Inizio" iconIos="f7:house_fill" iconMd="material:home" />
          <Link tabLink="#tab-search" text="Cerca" iconIos="f7:magnifyingglass" iconMd="material:search" />
          <Link tabLink="#tab-library" text="Libreria" iconIos="f7:rectangle_stack_fill" iconMd="material:video_library" />
          <Link tabLink="#tab-profile" text="Profilo" iconIos="f7:person_crop_circle" iconMd="material:person" />
      </Toolbar>

      <Tabs>
        <Tab id="tab-home" className="page-content" tabActive>
          <HomeTab />
        </Tab>
        <Tab id="tab-search" className="page-content">
          <SearchTab />
        </Tab>
        <Tab id="tab-library" className="page-content">
          <LibraryTab />
        </Tab>
        <Tab id="tab-profile" className="page-content">
          <ProfileTab />
        </Tab>
      </Tabs>
    </Page>
  );
}
