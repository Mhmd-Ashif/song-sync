import { Button } from "@/components/ui/button";
import { CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Play,
  Pause,
  HeadphoneOff,
  Headphones,
  CircleStop,
  LogOut,
  CircleArrowUp,
  Plus,
  Trash,
  Copy,
  Loader,
  StepForward,
  SkipForward,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import { toast } from "sonner";
import { socket } from "@/pages/dashboard";
import { useNavigate } from "react-router";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { RapidAPIKey } from "@/config";
import axios from "axios";
import "./music-player.css";
// new page so new socket is initialized
// import { io } from "socket.io-client";
// import { SocketAPI } from "@/config";
// const socket = io(SocketAPI, { transports: ["websocket"] });

export default function MusicPlayer() {
  const [play, setPlay] = useState(false);
  const [ytUrl, setYtUrl] = useState("");
  const [loading, isLoading] = useState(false);
  const [triggerDiv, setTriggerDiv] = useState(false);
  const [triggerDiv2, setTriggerDiv2] = useState(false);
  const [ytData, setYtData] = useState<any>({});
  const navigate = useNavigate();
  const [allSongs, setAllSongs] = useState<any>([]);
  const [playing, setPlaying] = useState<any>();
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [seekTo, setSeekTo] = useState<number | null>(null);
  //
  const [lastSyncTime, setLastSyncTime] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const [forceSeek, setForceSeek] = useState<number | null>(null);

  const playerRef = useRef<ReactPlayer>(null);

  const handlePlay = () => {
    setPlay(true);
    if (localStorage.getItem("userType") === "creator") {
      socket.emit("broadcast-sync", {
        roomId: localStorage.getItem("roomId"),
        time: playedSeconds,
        isPlaying: true,
        currentSong: playing,
      });
    }
  };

  const handlePause = () => {
    setPlay(false);
    if (localStorage.getItem("userType") === "creator") {
      socket.emit("broadcast-sync", {
        roomId: localStorage.getItem("roomId"),
        time: playedSeconds,
        isPlaying: false,
        currentSong: playing,
      });
    }
  };

  const handlePlayNext = () => {
    const roomId = localStorage.getItem("roomId");
    console.log(roomId);
    if (localStorage.getItem("userType") === "creator" && allSongs.length > 0) {
      socket.emit("play-next", roomId);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("userType") === "audience") {
      socket.emit("request-initial-sync", localStorage.getItem("roomId"));

      socket.on(
        "initial-sync",
        ({
          time,
          isPlaying,
          currentSong,
        }: {
          time: number;
          isPlaying: boolean;
          currentSong?: any;
        }) => {
          if (playerRef.current) {
            playerRef.current.seekTo(time, "seconds");
            setPlayedSeconds(time);
          }
          if (currentSong) {
            setPlaying(currentSong);
          }
          setPlayedSeconds(time);
          setForceSeek(time);
          setPlay(isPlaying);

          setTimeout(() => {
            setPlayedSeconds(time);
          }, 100);
          console.log("Initial sync complete:", { time, isPlaying });
        }
      );

      socket.on(
        "receive-sync",
        ({ time, isPlaying }: { time: number; isPlaying: boolean }) => {
          if (Math.abs(time - playedSeconds) > 1) {
            setPlayedSeconds(time);
          }

          setPlay(isPlaying);
        }
      );
    }

    return () => {
      socket.off("initial-sync");
      socket.off("receive-sync");
    };
  }, []);

  useEffect(() => {
    console.log("not ready");
    console.log(forceSeek);
    console.log(playedSeconds);
    console.log(play);
  }, [isReady, forceSeek]);

  async function exitRoom() {
    try {
      const result: { success: boolean } = await new Promise(
        (resolve: any, reject: any) => {
          socket.emit(
            "leave-room",
            localStorage.getItem("roomId"),
            (response: any) => {
              if (response.success) {
                resolve(response);
              } else {
                reject(new Error("failed to leave the room"));
              }
            }
          );
        }
      );
      if (result?.success) {
        toast("exited from the room successfully");
        navigate("/dashboard");
      } else {
        toast("Error Occured in FE");
        navigate(`/stream/${localStorage.getItem("roomId")}`);
      }
    } catch (error) {
      toast("Error Occured in server");
      console.log("error happened", error);
    }
  }

  socket.on("removed-from-room", () => {
    toast(`room closed by the owner in the room id of`);
    navigate("/dashboard");
  });

  async function deleteRoom() {
    try {
      await new Promise((resolve: any, reject: any) => {
        socket.emit(
          "remove-all-users",
          localStorage.getItem("roomId"),
          (response: any) => {
            if (response.success) {
              resolve(response);
              navigate("/dashboard");
            } else {
              reject(new Error("failed to leave the room"));
            }
          }
        );
      });
    } catch (error) {
      toast("Error Occured in server");
      console.log("error happened", error);
    }
  }

  async function getYoutubeVideo() {
    console.log(ytUrl);
    isLoading(true);

    const options = {
      method: "GET",
      url: "https://youtube138.p.rapidapi.com/video/details/",
      params: {
        id: ytUrl,
      },
      headers: {
        "x-rapidapi-key": RapidAPIKey,
      },
    };
    try {
      const response = await axios.request(options);
      const thumbnailImg = response.data.thumbnails.filter(
        (t: any) => t.width == 320 && t.height == 180
      );
      console.log(response.data);
      const min = new Date(response.data.lengthSeconds * 1000).getUTCMinutes();
      const sec = new Date(response.data.lengthSeconds * 1000).getUTCSeconds();
      setYtData({
        url: ytUrl,
        videoId: response.data.videoId,
        title: response.data.title,
        thumbnailImg,
        min,
        sec,
        publishedDate: response.data.publishedDate,
      });
      console.log("this is url");
      console.log(ytUrl);
      console.log(ytData);
      isLoading(false);
      setTriggerDiv(false);
      setTriggerDiv2(true);
    } catch (error) {
      isLoading(false);
      toast("Please Enter the Valid Youtube Url video or Try again sometimes");
    }
  }

  async function addSong() {
    const roomId = localStorage.getItem("roomId");
    try {
      const response = await new Promise((resolve, reject) => {
        socket.emit("add-song", { roomId, ytData }, (res: any) => {
          if (res?.success) {
            resolve(res);
            toast(res.msg);
          } else {
            reject(new Error("Failed to add song"));
          }
        });
      });

      setTriggerDiv2(false);
      console.log("Song added successfully:", response);
    } catch (error) {
      console.error(error);
      setTriggerDiv2(false);
      toast("Redis Server Error");
    }
  }

  useEffect(() => {
    const handleQueueUpdated = ({ parsedSongs, nowPlaying }: any) => {
      console.log("Queue received:", parsedSongs);
      console.log("Now playing:", nowPlaying);

      setAllSongs(
        parsedSongs.map((song: any) => ({
          ...song,
          duration: `${song.min}:${song.sec}`,
        }))
      );

      if (nowPlaying) {
        setPlaying(nowPlaying);
        // console.log(play);
        // setPlay(true);
      }
    };

    socket.on("queue-updated", handleQueueUpdated);

    return () => {
      socket.off("queue-updated", handleQueueUpdated);
    };
  }, []);

  useEffect(() => {
    const updateList = ({ song }: any) => {
      console.log("this is induvidual", song);
      if (song.playing) {
        setPlaying(song);
        setPlay(true);
      } else {
        setAllSongs((prevSongs: any) => [
          ...prevSongs,
          {
            ...song,
            duration: `${song.min}:${song.sec}`,
          },
        ]);
      }
    };

    socket.on("update-induvidual", updateList);

    return () => {
      socket.off("update-induvidual", updateList);
    };
  }, []);

  return (
    <div className="text-white mt-20">
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem] animate-blob" />
      </div>
      <div className="w-full text-white border-none">
        <CardHeader className="flex flex-col md:flex-row gap-6">
          <div className="rounded-md overflow-hidden">
            <div style={{ position: "relative" }}>
              {playing ? (
                <ReactPlayer
                  url={playing?.url}
                  ref={playerRef}
                  controls={false}
                  config={{
                    file: {
                      attributes: {
                        controlsList: "nodownload nofullscreen noplaybackrate",
                        disablePictureInPicture: true,
                      },
                    },
                  }}
                  width="100%"
                  height="100%"
                  playing={play}
                  onReady={() => {
                    if (localStorage.getItem("userType") === "audience") {
                      socket.emit(
                        "request-initial-sync",
                        localStorage.getItem("roomId")
                      );
                    }
                  }}
                  onPlay={handlePlay}
                  onPause={handlePause}
                  onEnded={handlePlayNext} 
                  played={forceSeek}
                  onProgress={({ playedSeconds }) => {
                    setPlayedSeconds(playedSeconds);
                    if (localStorage.getItem("userType") === "creator") {
                      socket.emit("broadcast-sync", {
                        roomId: localStorage.getItem("roomId"),
                        time: playedSeconds,
                        isPlaying: play,
                        currentSong: playing,
                      });
                    }
                  }}
                  progressInterval={100} 
                />
              ) : (
                ""
              )}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  background: "transparent",
                  pointerEvents: "auto",
                }}
              ></div>
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl md:text-5xl font-bold leading-tight">
              {playing ? playing.title : "There Are No Songs Playing Currently"}
            </h1>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>
                {playing
                  ? `Date of Upload : ${playing.publishedDate}`
                  : "Try Adding Songs via Add Song Button Below"}
              </span>
            </div>
            <div className="text-end md:text-start">
              <div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      {" "}
                      <Button
                        className="text-lg"
                        variant={"ghost"}
                        onClick={() => {
                          toast("room id copied Successfully");
                          navigator.clipboard.writeText(
                            localStorage.getItem("roomId") || ""
                          );
                        }}
                      >
                        <Copy />
                        {localStorage.getItem("roomId")}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Click To Copy</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="md:flex items-center gap-4 mb-8">
            {localStorage.getItem("ownerId") && (
              <div className="flex gap-4 ">
                <>
                  <Button
                    size="icon"
                    className="rounded-full"
                    onClick={handlePlay}
                  >
                    <Play className="w-5 h-5" />
                  </Button>
                  <Button
                    size="icon"
                    className="rounded-full"
                    onClick={handlePause}
                  >
                    <Pause className="w-5 h-5" />
                  </Button>
                  <Button
                    size="icon"
                    className="rounded-full"
                    onClick={handlePlayNext}
                    disabled={!play}
                  >
                    <SkipForward className="w-5 h-5" />
                  </Button>
                </>
              </div>
            )}
            <div
              className={`ml-auto ${
                localStorage.getItem("userType") == "creator" && "mt-6"
              } md:mt-0 `}
            >
              <Dialog open={triggerDiv}>
                <DialogTrigger>
                  <Button
                    variant="default"
                    className="rounded-full mr-3"
                    onClick={() => setTriggerDiv(true)}
                  >
                    <Plus className="w-5 h-5" />
                    Add Song
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Paste the Youtube Video Link</DialogTitle>
                    <DialogDescription>
                      <b>format : </b>
                      https://youtu.be/3Tj0tR1akjU?si=tPFKDx8Viznd7Z8T
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex items-center space-x-2">
                    <div className="grid flex-1 gap-2">
                      <Label htmlFor="link" className="sr-only">
                        Link
                      </Label>
                      <Input
                        id="link"
                        onChange={(e) => {
                          setYtUrl(e.target.value);
                        }}
                      />
                    </div>
                  </div>
                  <DialogFooter className="sm:justify-start">
                    <Button
                      variant={"destructive"}
                      onClick={() => setTriggerDiv(false)}
                      disabled={loading}
                    >
                      <Label>Cancel</Label>
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={getYoutubeVideo}
                      disabled={loading}
                      className="mb-2 sm:mb-0"
                    >
                      {loading ? (
                        <Label className="animate-spin">
                          <Loader />
                        </Label>
                      ) : (
                        <Label>Submit</Label>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Dialog open={triggerDiv2}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>About Video</DialogTitle>
                  </DialogHeader>
                  <div className="flex place-content-center">
                    <div className="">
                      {ytData?.thumbnailImg?.length > 0 ? (
                        <img src={ytData.thumbnailImg[0].url}></img>
                      ) : (
                        ""
                      )}
                      <DialogDescription className="text-md mt-2">
                        <b>Title : </b>
                        {ytData.title}
                      </DialogDescription>
                      {/* <Label className="text-md">Title : </Label> */}
                    </div>
                  </div>
                  <DialogFooter className="sm:justify-start">
                    <Button
                      variant={"destructive"}
                      onClick={() => setTriggerDiv2(false)}
                      disabled={loading}
                    >
                      <Label>Cancel</Label>
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={addSong}
                      disabled={loading}
                      className="mb-2 sm:mb-0"
                    >
                      {loading ? (
                        <Label className="animate-spin">
                          <Loader />
                        </Label>
                      ) : (
                        <Label>Push to The List</Label>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              {localStorage.getItem("userType") == "audience" ? (
                <Button
                  variant="outline"
                  className="rounded-full mr-3 pt-5 pb-5 mt-2 md:mt-0"
                  onClick={exitRoom}
                >
                  <LogOut className="w-5 h-5 " />
                  Exit Room
                </Button>
              ) : (
                ""
              )}
              {localStorage.getItem("userType") != "audience" ||
              localStorage.getItem("ownerId") ? (
                <Dialog>
                  <DialogTrigger>
                    <Button
                      variant="destructive"
                      className="rounded-full mt-2 md:mt-0"
                      onClick={deleteRoom}
                    >
                      <Trash className="w-5 h-5 " />
                      Delete Room
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Are you absolutely sure?</DialogTitle>
                      <DialogDescription>
                        This action cannot be undone. This will permanently
                        delete your account and remove your data from our
                        servers.
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              ) : (
                ""
              )}
            </div>
          </div>

          <div className="space-y-2">
            {/* Song List */}
            {allSongs.length > 0 ? (
              allSongs.map((song: any, index: number) => (
                <div
                  key={index}
                  className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 px-4 py-2 rounded-md hover:bg-white/10"
                >
                  <div className="font-medium">{index + 1}</div>
                  <div>
                    <div className="font-medium">{song.title}</div>
                    <div className="text-sm text-gray-400">
                      {song.publishedDate}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-400 w-10">
                      {song.duration}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center font-semibold">
                No Songs in the queue
              </div>
            )}
          </div>
        </CardContent>
      </div>
    </div>
  );
}
