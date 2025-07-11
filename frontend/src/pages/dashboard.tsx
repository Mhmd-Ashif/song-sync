import { Navbar } from "@/components/navbar";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Music, Headphones } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import loadingToast from "@/components/loading-toast";
import { Input } from "@/components/ui/input";
import { io } from "socket.io-client";
import { toast } from "sonner";
import { useNavigate } from "react-router";
export const socket = io(import.meta.env.VITE_SocketAPI, {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  transports: ["websocket"],
});

export default function Dashboard() {
  const [hoverCreate, setHoverCreate] = useState(false);
  const [hoverJoin, setHoverJoin] = useState(false);
  const [div1, setDiv1] = useState(false);
  const [div2, setDiv2] = useState(false);
  const [value, setValue] = useState("");
  const [roomName, setRoomName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("roomId");
    localStorage.removeItem("userType");
    localStorage.removeItem("ownerId");
  }, []);

  const joinRoom = async () => {
    console.log(value);
    if (!(value.length < 6)) {
      socket.emit(
        "join-room",
        localStorage.getItem("displayName"),
        value,
        ({ success, message, userType, roomId }: any) => {
          if (success) {
            localStorage.setItem("userType", userType);
            localStorage.setItem("roomId", roomId);
            toast(message);
            navigate(`/stream/${roomId}`);
          } else {
            toast(message);
          }
        }
      );
    } else {
      toast("Please Enter the valid room id");
    }
  };

  const createRoom = async () => {
    loadingToast("Creating Room Please Wait ...");
    console.log(roomName);
    if (roomName.trim() !== "") {
      socket.emit(
        "create-room",
        roomName,
        ({ roomId, userType, ownerId }: any) => {
          console.log("room created");

          localStorage.setItem("roomId", roomId);
          localStorage.setItem("userType", userType);
          localStorage.setItem("ownerId", ownerId);
          toast("Successfully Joined , please Redirect to the new page");
          navigate(`/stream/${roomId}`);
        }
      );
    } else {
      console.log("error");
      toast("error,Please Specify the room name to continue");
    }
  };

  return (
    <>
      <Navbar></Navbar>
      <div className="fixed inset-0 z-0 ">
        <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-violet-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-1/2 h-1/2 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1/2 h-1/2 bg-pink-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8 mt-16 ">
          <h1 className="text-4xl font-bold mb-2 text-center text-white">
            Welcome Dashboard
          </h1>
          <h5 className="text-center mb-4 md:text-lg ">
            Feel Free Do Join or Create a Room
          </h5>
          <div className="grid md:grid-cols-2 gap-4 md:ml-20 md:mr-20 md:mt-14 ">
            <div
              className={`p-6 rounded-lg transition-all duration-300 backdrop-blur-3xl ${
                hoverCreate
                  ? "bg-gray-800 bg-opacity-30 "
                  : `bg-gray-900 bg-opacity-20 ${div1 ? "blur-sm" : "blur-0"} `
              }`}
              onMouseEnter={() => {
                setHoverCreate(true);
                setDiv2(true);
              }}
              onMouseLeave={() => {
                setHoverCreate(false);
                setDiv2(false);
              }}
            >
              <h2 className="text-2xl font-semibold mb-4 flex items-center text-violet-300">
                <Music className="mr-2" /> Create Room
              </h2>
              <p className="mb-4">
                Start your own music streaming room. Share your favorite tracks
                and create a unique listening experience for others.
              </p>
              <ul className="list-disc list-inside mb-6 text-violet-200">
                <li>Choose your Youtube Song</li>
                <li>Invite friends to join</li>
                <li>Use Multiple option</li>
              </ul>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-violet-700 hover:bg-violet-600 text-white">
                    Start Streaming
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle className="text-center">
                      Enter Your Room Name
                    </DialogTitle>
                  </DialogHeader>
                  <div className="">
                    <div className="items-center">
                      <Input
                        id="name"
                        className="col-span-3 border-2"
                        placeholder="vibniley"
                        onChange={(e) => {
                          setRoomName(e.target.value);
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-center">
                    <Button
                      className="bg-violet-700 hover:bg-violet-600 text-white"
                      onClick={createRoom}
                    >
                      Proceed
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div
              className={`p-6 rounded-lg transition-all duration-300 backdrop-blur-3xl ${
                hoverJoin
                  ? "bg-gray-800 bg-opacity-30 "
                  : `bg-gray-900 bg-opacity-20 ${div2 ? "blur-sm" : "blur-0"} `
              }`}
              onMouseEnter={() => {
                setHoverJoin(true);
                setDiv1(true);
              }}
              onMouseLeave={() => {
                setHoverJoin(false);
                setDiv1(false);
              }}
            >
              <h2 className="text-2xl font-semibold mb-4 flex items-center text-violet-300">
                <Headphones className="mr-2" /> Join Room
              </h2>
              <p className="mb-4">
                Join existing music rooms. Listen along with others, discover
                new tracks, and engage with the community.
              </p>
              <ul className="list-disc list-inside mb-6 text-violet-200">
                <li>Browse active rooms</li>
                <li>Add songs to the queue</li>
                <li>Get realtime Sync with creator</li>
              </ul>
              <Dialog>
                <DialogTrigger>
                  <Button className="bg-violet-700 hover:bg-violet-600 text-white ">
                    Start Listening
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="text-center ">
                      Enter Code To Join the Room
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-2 flex flex-col w-full items-center">
                    <InputOTP
                      maxLength={6}
                      value={value}
                      inputMode="text"
                      onChange={(value) => setValue(value)}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                    <div className="text-center text-sm">
                      {value === "" ? (
                        <>Enter six digit ID.</>
                      ) : (
                        <>You entered: {value}</>
                      )}
                    </div>
                    <div>
                      <Button className="mt-2" onClick={joinRoom}>
                        Submit
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
