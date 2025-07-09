import { client } from "../redis";

export async function addSongtoQueue(roomId: string, song: any) {
  const songKey = `room:${roomId}:songs`;
  const currentSongs = await client.lRange(songKey, 0, -1);

  const isDuplicate = currentSongs.some((s: any) => {
    const parserVid = JSON.parse(s);
    return parserVid.videoId == song.videoId;
  });

  if (!isDuplicate) {
    const isFirst = currentSongs.length === 0;
    const songToStore = {
      ...song,
      playing: isFirst ? true : false,
    };
    await client.rPush(`room:${roomId}:songs`, JSON.stringify(songToStore));
    return { val: true, songToStore };
  } else {
    return { val: false };
  }
}

export async function popSongAndUpdateNext(roomId: string) {
  const songKey = `room:${roomId}:songs`;

  const poppedSongRaw = await client.lPop(songKey);

  if (!poppedSongRaw) return null;

  const nextSongRaw = await client.lIndex(songKey, 0);

  if (nextSongRaw) {
    const parsed = JSON.parse(nextSongRaw);
    const updated = { ...parsed, playing: true };
    await client.lSet(songKey, 0, JSON.stringify(updated));
    return { popped: JSON.parse(poppedSongRaw), nowPlaying: updated };
  }

  return { popped: JSON.parse(poppedSongRaw), nowPlaying: null };
}

