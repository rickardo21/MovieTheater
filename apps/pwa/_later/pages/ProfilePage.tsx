import { Page, Navbar, NavTitleLarge, List, ListItem, Block } from "framework7-react";

// Profilo senza login: l'accesso con Firebase verrà aggiunto dopo
export default function ProfilePage() {
  return (
    <Page>
      <Navbar transparent>
        <NavTitleLarge>Profilo</NavTitleLarge>
      </Navbar>
      <Block className="empty-state">
        <p>Accedi per sincronizzare la libreria su tutti i tuoi dispositivi.</p>
      </Block>
      <List strong inset>
        <ListItem title="Impostazioni" link="#" />
        <ListItem title="Riproduzione" link="#" />
        <ListItem title="Informazioni" link="#" />
      </List>
    </Page>
  );
}
