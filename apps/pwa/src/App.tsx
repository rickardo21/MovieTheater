import { App as F7App, View, Page, Navbar, Block } from "framework7-react";

// Base minima: una sola pagina, per verificare che l'app si avvii
function HomePage() {
  return (
    <Page>
      <Navbar title="MovieTheater" />
      <Block>
        <p>L'app si avvia correttamente.</p>
      </Block>
    </Page>
  );
}

const f7params = {
  name: "MovieTheater",
  theme: "ios" as const,
  routes: [{ path: "/", component: HomePage }],
};

export default function App() {
  return (
    <F7App {...f7params}>
      <View main url="/" />
    </F7App>
  );
}
