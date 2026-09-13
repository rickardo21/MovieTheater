const BASE = "https://vixsrc.to";

const HEADERS_HTML: HeadersInit = {
    Accept: "text/html,application/xhtml+xml",
    Referer: `${BASE}/`,
    "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
};

const HEADERS_JSON: HeadersInit = {
    Accept: "application/json",
    Referer: `${BASE}/`,
    "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
};

const HEADERS_PLAYLIST: HeadersInit = {
    accept: "*/*",
    "accept-language": "en-US,en;q=0.9,it-IT;q=0.8,it;q=0.7",
    priority: "u=1, i",
    "sec-ch-ua":
        '"Chromium";v="152", "Not?A_Brand";v="24", "Google Chrome";v="152"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "sec-fetch-storage-access": "active",
    "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36",
};

export type ContentType = "movie" | "tv";

export interface ContentSrcResult {
    src: string;
}

export interface MasterPlaylistInfo {
    base_url: string;
    token: string | null;
    expires: string | null;
}

export interface PlaylistTrack {
    name: string;
    language: string;
    url: string;
}

export interface VideoQuality {
    resolution: string;
    bandwidth: string;
    url: string;
}

export interface ParsedMasterPlaylist {
    video_qualities: VideoQuality[];
    audios: PlaylistTrack[];
    subtitles: PlaylistTrack[];
}

export interface GetMasterPlaylistResult {
    embedUrl: string;
    masterUrl: string;
    text: string;
    parsed: ParsedMasterPlaylist;
}

/**
 * Ottiene il campo 'src' dell'embed per un film o un episodio.
 */
export async function getContentSrc(
    type: ContentType,
    id: number,
    season?: number,
    episode?: number
): Promise<string> {
    let url: string;

    if (type === "movie") {
        url = `${BASE}/api/movie/${id}`;
    } else if (type === "tv") {
        if (season == null || episode == null) {
            throw new Error("Per le serie TV servono season ed episode");
        }
        url = `${BASE}/api/tv/${id}/${season}/${episode}`;
    } else {
        throw new Error("type deve essere 'movie' o 'tv'");
    }

    const res = await fetch(url, { headers: HEADERS_JSON });
    if (!res.ok) {
        throw new Error(`HTTP ${res.status} getting content src`);
    }

    const data = (await res.json()) as ContentSrcResult;
    if (!data.src) {
        throw new Error("Nessun campo 'src' nella risposta API");
    }

    return data.src;
}

export function buildEmbedUrl(src: string): string {
    return new URL(src, BASE).toString();
}

export async function getEmbedHtml(embedUrl: string): Promise<string> {
    const res = await fetch(embedUrl, { headers: HEADERS_HTML });
    if (!res.ok) {
        throw new Error(`HTTP ${res.status} getting embed HTML`);
    }
    return res.text();
}

export function extractMasterPlaylistInfo(
    html: string
): MasterPlaylistInfo | null {
    const urlMatch =
        /window\.masterPlaylist\s*=\s*\{[^}]*params:\s*\{[^}]*\}[^}]*url:\s*'([^']+)/.exec(
            html
        ) ||
        /window\.masterPlaylist\s*=\s*\{[^}]*params:\s*\{[^}]*\}[^}]*url:\s*"([^"]+)"/.exec(
            html
        );

    if (!urlMatch) return null;

    const base_url = urlMatch[1];

    const tokenMatch = /'token'\s*:\s*'([^']+)'/.exec(html);
    const expiresMatch = /'expires'\s*:\s*'([^']+)'/.exec(html);

    const token = tokenMatch ? tokenMatch[1] : null;
    const expires = expiresMatch ? expiresMatch[1] : null;

    return { base_url, token, expires };
}

export function buildMasterUrl(info: MasterPlaylistInfo): string {
    const url = new URL(info.base_url);

    if (info.token) url.searchParams.set("token", info.token);
    if (info.expires) url.searchParams.set("expires", info.expires);

    url.searchParams.set("h", "1");
    url.searchParams.set("lang", "it");

    return url.toString();
}

export async function fetchMasterPlaylistText(
    masterUrl: string,
    embedUrl: string
): Promise<string> {
    const headers: HeadersInit = {
        ...HEADERS_PLAYLIST,
        referer: embedUrl,
    };

    const res = await fetch(masterUrl, { headers });
    if (!res.ok) {
        throw new Error(`HTTP ${res.status} getting master playlist`);
    }
    return res.text();
}

export function parseMasterPlaylist(
    text: string,
    masterUrl: string
): ParsedMasterPlaylist {
    const base = masterUrl.slice(0, masterUrl.lastIndexOf("/") + 1);

    const audios: PlaylistTrack[] = [];
    const subtitles: PlaylistTrack[] = [];
    const video_qualities: VideoQuality[] = [];

    const mediaRe =
        /#EXT-X-MEDIA:TYPE=(?<type>[^,]+),.*?NAME="(?<name>[^"]+)".*?LANGUAGE="(?<lang>[^"]+)".*?URI="(?<uri>[^"]+)"/g;

    for (const m of text.matchAll(mediaRe)) {
        const t = m.groups?.type;
        const name = m.groups?.name ?? "";
        const lang = m.groups?.lang ?? "";
        const uri = m.groups?.uri ?? "";
        const url = uri.startsWith("http")
            ? uri
            : new URL(uri, base).toString();

        if (t === "AUDIO") {
            audios.push({ name, language: lang, url });
        } else if (t === "SUBTITLES") {
            subtitles.push({ name, language: lang, url });
        }
    }

    const lines = text.split(/\r?\n/);
    let i = 0;
    while (i < lines.length) {
        const line = lines[i]!.trim();
        if (line.startsWith("#EXT-X-STREAM-INF:")) {
            const streamUrlRaw = lines[i + 1]?.trim();
            if (streamUrlRaw && !streamUrlRaw.startsWith("#")) {
                const streamUrl = streamUrlRaw.startsWith("http")
                    ? streamUrlRaw
                    : new URL(streamUrlRaw, base).toString();

                const attrs: Record<string, string> = {};
                const attrRe = /([A-Z0-9-]+)=("([^"]+)"|([^,]+))/g;
                let match: RegExpExecArray | null;
                while ((match = attrRe.exec(line)) !== null) {
                    const key = match[1]!;
                    const val = match[3] ?? match[4];
                    attrs[key] = val!;
                }

                video_qualities.push({
                    resolution: attrs.RESOLUTION ?? "",
                    bandwidth: attrs.BANDWIDTH ?? "",
                    url: streamUrl,
                });

                i += 2;
                continue;
            }
        }
        i++;
    }

    return { video_qualities, audios, subtitles };
}

/**
 * Funzione principale che, dato un film o un episodio, restituisce:
 * - embedUrl
 * - masterUrl
 * - testo della master playlist
 * - playlist parsata (video, audio, subs)
 */
export async function getMasterPlaylistForContent(
    type: ContentType,
    id: number,
    season?: number,
    episode?: number
): Promise<GetMasterPlaylistResult> {
    const src = await getContentSrc(type, id, season, episode);
    const embedUrl = buildEmbedUrl(src);
    const html = await getEmbedHtml(embedUrl);

    const info = extractMasterPlaylistInfo(html);
    if (!info) {
        throw new Error("Nessuna window.masterPlaylist trovata");
    }

    const masterUrl = buildMasterUrl(info);
    const text = await fetchMasterPlaylistText(masterUrl, embedUrl);
    const parsed = parseMasterPlaylist(text, masterUrl);

    return { embedUrl, masterUrl, text, parsed };
}

/**
 * Sceglie la migliore qualità video disponibile, preferendo quella
 * con altezza più vicina a targetHeight (es. 1080), senza superarla se possibile.
 * Se non ci sono qualità <= target, prende la massima disponibile.
 */
export function chooseBestVideoQuality(
    videoQualities: VideoQuality[],
    targetHeight: number = 1080
): VideoQuality | null {
    if (!videoQualities.length) return null;

    function parseResolution(res: string): [number, number] {
        if (!res) return [0, 0];
        try {
            const [w, h] = res.split("x").map((n) => parseInt(n, 10));
            return [w || 0, h || 0];
        } catch {
            return [0, 0];
        }
    }

    const candidatesLe = videoQualities
        .map((v) => {
            const [, h] = parseResolution(v.resolution);
            return { h, v };
        })
        .filter(({ h }) => h <= targetHeight);

    if (candidatesLe.length) {
        candidatesLe.sort((a, b) => b.h - a.h);
        return candidatesLe[0]!.v;
    }

    const all = videoQualities.map((v) => {
        const [, h] = parseResolution(v.resolution);
        return { h, v };
    });
    all.sort((a, b) => b.h - a.h);
    return all[0]!.v;
}