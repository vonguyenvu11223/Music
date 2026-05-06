export type YouTubeTrack = {
  id: string;
  name: string;
  artist_name: string;
  audio: string;
  image?: string;
};

function norm(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\(\)\[\]\{\}\-_,.!?'"`~]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function similarity(a: string, b: string) {
  // lightweight token overlap score (0..1)
  const A = new Set(norm(a).split(" ").filter(Boolean));
  const B = new Set(norm(b).split(" ").filter(Boolean));
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const t of A) if (B.has(t)) inter++;
  return inter / Math.max(A.size, B.size);
}

export function matchSpotifyToYouTube(
  input: { title: string; artist: string },
  candidates: YouTubeTrack[],
) {
  let best: { score: number; item: YouTubeTrack } | null = null;

  for (const c of candidates) {
    const titleScore = similarity(input.title, c.name);
    const artistScore = similarity(input.artist, c.artist_name);
    const score = titleScore * 0.7 + artistScore * 0.3;
    if (!best || score > best.score) best = { score, item: c };
  }

  // empirical threshold to avoid wrong matches
  if (!best || best.score < 0.72) return null;
  return best.item;
}
