import { Link } from "framework7-react";
import { img, titleOf, type TitleItem } from "../lib/api";

interface PosterProps {
  item: TitleItem;
  mediaType: "movie" | "tv";
  rank?: number;
}

// Locandina con numero opzionale, come nelle classifiche "Top 10"
export default function Poster({ item, mediaType, rank }: PosterProps) {
  const src = img(item.poster_path, "w342");
  const title = titleOf(item);

  return (
    <Link href={`/detail/${mediaType}/${item.id}/`} className="poster">
      <div className="poster-art">
        {src ? <img src={src} alt="" loading="lazy" /> : <div className="poster-fallback">{title}</div>}
        {rank !== undefined && <span className="poster-rank">{rank}</span>}
      </div>
      <p className="poster-name">{title}</p>
    </Link>
  );
}
