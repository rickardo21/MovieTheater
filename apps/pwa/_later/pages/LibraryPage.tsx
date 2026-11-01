import { Page, Navbar, NavTitleLarge, Block } from "framework7-react";

export default function LibraryPage() {
  return (
    <Page>
      <Navbar transparent>
        <NavTitleLarge>Libreria</NavTitleLarge>
      </Navbar>
      <Block className="empty-state">
        <h2>La libreria è vuota</h2>
        <p>I titoli che salvi compariranno qui.</p>
      </Block>
    </Page>
  );
}
