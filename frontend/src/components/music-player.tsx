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
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { useState } from "react";
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

  const handlePlay = () => {
    setPlay(true);
  };

  const handlePause = () => {
    setPlay(false);
  };

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
        //alt way :  reload dashboard and remove all the localstorage
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
      // console.log(response.data);
      const min = new Date(response.data.lengthSeconds * 1000).getUTCMinutes();
      const sec = new Date(response.data.lengthSeconds * 1000).getUTCSeconds();
      setYtData({
        url: ytUrl,
        videoId: response.data.videoId,
        title: response.data.title,
        thumbnailImg,
        min,
        sec,
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

  socket.on("queue-updated", () => {
    // toast(song);
    console.log("New song added");
  });

  return (
    <div className="text-white mt-20">
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem] animate-blob" />
      </div>
      <div className="w-full text-white border-none">
        <CardHeader className="flex flex-col md:flex-row gap-6">
          <div className="rounded-md overflow-hidden">
            {/* <ReactPlayer
              url="https://www.youtube.com/watch?v=FXiaIH49oAU"
              controls={false}
              height={"100%"}
              width={"100%"}
              onPause={handlepause}
              playing={play}
            /> */}
            <div style={{ position: "relative" }}>
              <ReactPlayer
                url="https://www.youtube.com/watch?v=FXiaIH49oAU"
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
              />
              {/* Overlay div to block interactions */}
              {/* Transparent overlay to block play/pause */}
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
              Chekka Chivantha Vaanam (Original Motion Picture Soundtrack)
            </h1>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span className="font-medium text-white">A.R. Rahman</span>
              <span>•</span>
              <span>2018</span>
            </div>
            <div className="text-end">
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
            <div className="flex gap-4 ">
              <Button size="icon" className="rounded-full" onClick={handlePlay}>
                <Play className="w-5 h-5" />
              </Button>
              <Button
                size="icon"
                className="rounded-full"
                onClick={handlePause}
              >
                <Pause className="w-5 h-5" />
              </Button>
            </div>
            <div className="ml-auto mt-6 md:mt-0 ">
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
            {[
              {
                title: "Bhoomi Bhoomi",
                artist: "A.R. Rahman, Shakthisree Gopalan",
                plays: "5,658,086",
                duration: "4:37",
              },
              {
                title: "Mazhai Kuruvi",
                artist: "A.R. Rahman",
                plays: "41,200,936",
                duration: "5:48",
              },
              {
                title: "Hayati",
                artist: "A.R. Rahman, Ar Ameen",
                plays: "3,245,789",
                duration: "4:52",
              },
              {
                title: "Kalla Kalavaani",
                artist: "A.R. Rahman, Aravind Srinivas, Aparna Narayanan",
                plays: "2,987,654",
                duration: "3:59",
              },
              {
                title: "Sevandhu Pochu Nenju",
                artist: "A.R. Rahman, Shakthisree Gopalan",
                plays: "4,567,890",
                duration: "5:12",
              },
              {
                title: "Naan Yen",
                artist: "A.R. Rahman, Karthik",
                plays: "3,876,543",
                duration: "4:45",
              },
              {
                title: "Chekka Chivantha Vaanam",
                artist: "A.R. Rahman",
                plays: "2,345,678",
                duration: "4:17",
              },
            ].map((song, index) => (
              <div
                key={index}
                className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 px-4 py-2 rounded-md hover:bg-white/10"
              >
                <div className="font-medium">{index + 1}</div>
                <div>
                  <div className="font-medium">{song.title}</div>
                  <div className="text-sm text-gray-400">{song.artist}</div>
                </div>

                <div className="flex items-center gap-4">
                  <Button
                    size="sm"
                    variant="link"
                    className="rounded-full"
                    onClick={() => {
                      console.log("upvoted");
                    }}
                  >
                    <CircleArrowUp className="w-8. h-8" />
                  </Button>

                  <span className="text-sm text-gray-400">{song.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </div>
    </div>
  );
}
