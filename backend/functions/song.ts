import { client } from "../redis";

export async function addSongtoQueue(roomId: string, song: any) {
  const songKey = `room:${roomId}:songs`;
  const currentSongs = await client.lRange(songKey, 0, -1);

  const isDuplicate = currentSongs.some((s: any) => {
    const parserVid = JSON.parse(s);
    return parserVid.videoId == song.videoId;
  });

  if (!isDuplicate) {
    await client.lPush(`room:${roomId}:songs`, JSON.stringify(song));
    console.log(`Song added to room ${roomId}:`, song);
    return true;
  } else {
    return false;
  }
}
