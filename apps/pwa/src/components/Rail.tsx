import { BlockTitle } from "framework7-react";
import Poster from "./Poster";
import type { MediaType, TitleItem } from "../lib/api";

export interface RailEntry {
  item: TitleItem;
  mediaType: MediaType;
}

interface RailProps {
  title: string;
  entries: RailEntry[];
  ranked?: boolean;
}

// Riga orizzontale di locandine con titolo di sezione
export default function Rail({ title, entries, ranked }: RailProps) {
  if (entries.length === 0) return null;
  return (
    <section className="rail-section">
      <BlockTitle medium>{title}</BlockTitle>
      <div className="rail">
        {entries.map((e, i) => (
          <Poster key={`${e.mediaType}-${e.item.id}`} item={e.item} mediaType={e.mediaType} rank={ranked ? i + 1 : undefined} />
        ))}
      </div>
    </section>
  );
}

// Segnaposto mentre i dati arrivano: la schermata appare subito (HIG › Loading)
export function RailSkeleton({ count = 6 }: { count?: number }) {
  return (
    <section className="rail-section">
      <div className="rail skeleton-effect-wave" aria-hidden="true">
        {Array.from({ length: count }, (_, i) => (
          <span key={i} className="poster">
            <span className="poster-art skeleton-block" />
          </span>
        ))}
      </div>
    </section>
  );
}
