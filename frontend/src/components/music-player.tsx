import { Button } from "@/components/ui/button";
import { CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

// new page so new socket is initialized
// import { io } from "socket.io-client";
// import { SocketAPI } from "@/config";
// const socket = io(SocketAPI, { transports: ["websocket"] });

export default function MusicPlayer() {
  const [play, setPlay] = useState(false);
  const navigate = useNavigate();

  const handlePlay = () => {
    setPlay(!play);
  };

  const handlepause = () => {
    setPlay(!play);
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

  return (
    <div className="text-white mt-20">
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem] animate-blob" />
      </div>
      <div className="w-full text-white border-none">
        <CardHeader className="flex flex-col md:flex-row gap-6">
          <div className="rounded-md overflow-hidden">
            <ReactPlayer
              url="https://www.youtube.com/watch?v=FXiaIH49oAU"
              controls={false}
              height={"100%"}
              width={"100%"}
              onPause={handlepause}
              playing={play}
            />
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
              <Button size="icon" className="rounded-full" onClick={handlePlay}>
                <Pause className="w-5 h-5" />
              </Button>
              <Button size="icon" className="rounded-full">
                <HeadphoneOff className="w-5 h-5" />
              </Button>
              <Button size="icon" className="rounded-full">
                <Headphones className="w-5 h-5" />
              </Button>
              <Button size="icon" className="rounded-full">
                <CircleStop className="w-5 h-5" />
              </Button>
            </div>
            <div className="ml-auto mt-6 md:mt-0 ">
              <Dialog>
                <DialogTrigger>
                  <Button variant="default" className="rounded-full mr-3">
                    <Plus className="w-5 h-5" />
                    Add Song
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. This will permanently delete
                      your account and remove your data from our servers.
                    </DialogDescription>
                  </DialogHeader>
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
                  <Button size="sm" variant="link" className="rounded-full">
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
