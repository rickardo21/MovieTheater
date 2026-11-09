import { Link } from "framework7-react";
import { img, titleOf, type MediaType, type TitleItem } from "../lib/api";

interface PosterProps {
  item: TitleItem;
  mediaType: MediaType;
  rank?: number;
}

// Locandina con numero opzionale, come nelle classifiche "Top 10"
export default function Poster({ item, mediaType, rank }: PosterProps) {
  const src = img(item.poster_path, "w342");
  const title = titleOf(item);

  return (
    <Link href={`/detail/${mediaType}/${item.id}/`} className="poster" aria-label={title}>
      <span className="poster-art">
        {src ? <img src={src} alt="" loading="lazy" /> : <span className="poster-fallback">{title}</span>}
        {rank !== undefined && <span className="poster-rank">{rank}</span>}
      </span>
      <span className="poster-name">{title}</span>
    </Link>
  );
}
