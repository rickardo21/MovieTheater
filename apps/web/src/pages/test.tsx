// import { useEffect, useRef, useState } from "react";
// import Hls from "hls.js";
// import { getMasterPlaylistForContent } from "@movietheater/shared/src/api/vixsrcapi";

// export default function Test() {
//     const videoRef = useRef<HTMLVideoElement | null>(null);
//     const [masterUrl, setMasterUrl] = useState<string>("");
//     const [error, setError] = useState<string | null>(null);

//     const [qualities, setQualities] = useState<
//         { label: string; level: number }[]
//     >([]);
//     const [audioTracks, setAudioTracks] = useState<
//         { name: string; lang: string; index: number }[]
//     >([]);
//     const [subtitleTracks, setSubtitleTracks] = useState<
//         { name: string; lang: string; index: number }[]
//     >([]);

//     const [selectedQuality, setSelectedQuality] = useState<number>(-1); // -1 = auto
//     const [selectedAudio, setSelectedAudio] = useState<number>(0);
//     const [selectedSubtitle, setSelectedSubtitle] = useState<number>(-1); // -1 = off

//     useEffect(() => {
//         let hls: Hls | null = null;

//         if (!masterUrl || !videoRef.current) return;

//         const video = videoRef.current;

//         if (Hls.isSupported()) {
//             hls = new Hls({
//                 debug: false,
//             });

//             hls.loadSource(masterUrl);
//             hls.attachMedia(video);

//             hls.on(Hls.Events.MANIFEST_PARSED, () => {
//                 // Quality levels
//                 const levels = hls.levels.map((level, index) => ({
//                     label: level.height
//                         ? `${level.height}p`
//                         : `${Math.round(level.bitrate / 1000)}kbps`,
//                     level: index,
//                 }));

//                 setQualities([
//                     { label: "Auto", level: -1 },
//                     ...levels,
//                 ]);
//                 setSelectedQuality(hls.currentLevel);

//                 // Audio tracks
//                 const audios = hls.audioTracks.map((track, index) => ({
//                     name: track.name,
//                     lang: track.lang,
//                     index,
//                 }));
//                 setAudioTracks(audios);
//                 if (audios.length) setSelectedAudio(hls.audioTrack);

//                 // Subtitle tracks
//                 const subs = hls.subtitleTracks.map((track, index) => ({
//                     name: track.name,
//                     lang: track.lang,
//                     index,
//                 }));
//                 setSubtitleTracks(subs);
//                 setSelectedSubtitle(hls.subtitleTrack ?? -1);

//                 video.play().catch(() => { });
//             });

//             hls.on(Hls.Events.ERROR, (_, data) => {
//                 if (data.fatal) {
//                     setError(`Errore HLS: ${data.type}`);
//                 }
//             });
//         } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
//             // Safari
//             video.src = masterUrl;
//             video.addEventListener("loadedmetadata", () => {
//                 video.play().catch(() => { });
//             });
//         }

//         return () => {
//             if (hls) {
//                 hls.destroy();
//             }
//         };
//     }, [masterUrl]);

//     useEffect(() => {
//         const video = videoRef.current;
//         const hls = (video as any)?.hls as Hls | undefined;
//         if (!hls) return;

//         if (selectedQuality !== hls.currentLevel) {
//             hls.currentLevel = selectedQuality;
//         }
//     }, [selectedQuality]);

//     useEffect(() => {
//         const video = videoRef.current;
//         const hls = (video as any)?.hls as Hls | undefined;
//         if (!hls || !audioTracks.length) return;

//         if (selectedAudio !== hls.audioTrack) {
//             hls.audioTrack = selectedAudio;
//         }
//     }, [selectedAudio, audioTracks]);

//     useEffect(() => {
//         const video = videoRef.current;
//         const hls = (video as any)?.hls as Hls | undefined;
//         if (!hls) return;

//         if (selectedSubtitle !== hls.subtitleTrack) {
//             hls.subtitleTrack = selectedSubtitle;
//         }
//     }, [selectedSubtitle]);

//     useEffect(() => {
//         const testMovie = async () => {
//             try {
//                 const movie = await getMasterPlaylistForContent("movie", 1386315);
//                 setMasterUrl(movie.masterUrl);
//             } catch (e) {
//                 setError(e instanceof Error ? e.message : "Errore sconosciuto");
//             }
//         };
//         testMovie();
//     }, []);

//     return (
//         <div className="space-y-3 max-w-3xl mx-auto p-4">
//             <h1 className="text-xl font-semibold">Test Player VixSrc</h1>

//             {error && (
//                 <div className="text-red-500 text-sm">Errore: {error}</div>
//             )}

//             <video
//                 ref={videoRef}
//                 controls
//                 className="w-full rounded bg-black"
//                 style={{ maxHeight: "70vh" }}
//             />

//             <div className="flex flex-wrap gap-2 text-sm">
//                 <div className="flex items-center gap-2">
//                     <span>Qualità:</span>
//                     <select
//                         className="bg-neutral-800 border border-neutral-700 rounded px-2 py-1"
//                         value={selectedQuality}
//                         onChange={(e) => setSelectedQuality(Number(e.target.value))}
//                     >
//                         {qualities.map((q) => (
//                             <option key={q.level} value={q.level}>
//                                 {q.label}
//                             </option>
//                         ))}
//                     </select>
//                 </div>

//                 {audioTracks.length > 0 && (
//                     <div className="flex items-center gap-2">
//                         <span>Audio:</span>
//                         <select
//                             className="bg-neutral-800 border border-neutral-700 rounded px-2 py-1"
//                             value={selectedAudio}
//                             onChange={(e) => setSelectedAudio(Number(e.target.value))}
//                         >
//                             {audioTracks.map((a) => (
//                                 <option key={a.index} value={a.index}>
//                                     {a.name} ({a.lang})
//                                 </option>
//                             ))}
//                         </select>
//                     </div>
//                 )}

//                 {subtitleTracks.length > 0 && (
//                     <div className="flex items-center gap-2">
//                         <span>Sottotitoli:</span>
//                         <select
//                             className="bg-neutral-800 border border-neutral-700 rounded px-2 py-1"
//                             value={selectedSubtitle}
//                             onChange={(e) => setSelectedSubtitle(Number(e.target.value))}
//                         >
//                             <option value={-1}>Off</option>
//                             {subtitleTracks.map((s) => (
//                                 <option key={s.index} value={s.index}>
//                                     {s.name} ({s.lang})
//                                 </option>
//                             ))}
//                         </select>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }