import MusicPlayer from "@/components/music-player";
import { Navbar } from "@/components/navbar";
// import { SocketAPI } from "@/config";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { socket } from "./dashboard";
// import { io } from "socket.io-client";
// const socket = io(SocketAPI, { transports: ["websocket"] });

export default function Streaming() {
  const navigate = useNavigate();

  useEffect(() => {
    const roomId = localStorage.getItem("roomId");
    const ownerId = localStorage.getItem("ownerId");
    const displayName = localStorage.getItem("displayName");

    socket.emit("check-room", roomId, ownerId, ({ success, message }: any) => {
      if (success) {
        console.log(message);
        // Emit "join-room" if the room check is successful
        socket.emit("join-room", displayName, roomId, (response: any) => {
          if (response.success) {
            console.log(response.message);
          } else {
            console.error(response.message);
            navigate("/dashboard");
          }
        });
      } else {
        console.error(message);
        navigate("/dashboard");
      }
    });
  }, []);

  return (
    <>
      <Navbar />
      <MusicPlayer />
    </>
  );
}
