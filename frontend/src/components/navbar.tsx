import { BoltIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { getAuth, signOut } from "firebase/auth";
import { app } from "@/firebase";
import { toast } from "sonner";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";


export function Navbar() {
  const [logged, isLogged] = useState(false);
  const [userData, setUserData] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth(app);
  useEffect(() => {
    console.log(location);
    if (!(location.pathname == "") && localStorage.getItem("idToken")) {
      isLogged(true);
      setUserData({
        photoURL: localStorage.getItem("photoURL"),
        displayName: localStorage.getItem("displayName"),
        email: localStorage.getItem("email"),
      });
    } else {
      isLogged(false);
    }
  }, []);
  function googleSignout() {
    signOut(auth)
      .then(() => {
        localStorage.removeItem("idToken");
        localStorage.removeItem("email");
        localStorage.removeItem("photoURL");
        localStorage.removeItem("displayName");
        localStorage.removeItem("ownerId");
        toast("Logged Out Successfully");
        navigate("/");
      })
      .catch((error) => {
        console.log(error.message);
        toast("Error Logging In", {
          description: "Internal Server Error occurred",
        });
      });
  }

  console.log(userData)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-800 bg-black/50 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <a className="flex items-center space-x-2">
              <BoltIcon className="h-6 w-6 text-white" />
              <span className="text-xl font-semibold text-white">
                Song Sync
              </span>
            </a>
          </div>
          <div className="flex items-center space-x-6">
            {logged ? (
              <>
                <Sheet>
                  <SheetTrigger asChild className="hover:cursor-pointer">
                    <Avatar>
                      <AvatarImage
                        src={`${localStorage.getItem("photoURL")}`}
                        className="hover:cursor-pointer"
                      />
                      <AvatarFallback>
                        {localStorage.getItem("displayName")?.split("")[0]}
                      </AvatarFallback>
                    </Avatar>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>View profile</SheetTitle>
                      <SheetDescription>
                        View Your Personal Information Here and Log out can be
                        done here.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="grid gap-4 py-4 ">
                      <div className="w-full flex justify-center">
                        <Avatar>
                          <AvatarImage
                            src={`${localStorage.getItem("photoURL")}`}
                          />
                          <AvatarFallback>
                            {localStorage.getItem("displayName")?.split("")[0]}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                          Name
                        </Label>
                        <Input
                          id="name"
                          value={localStorage.getItem("displayName") || ""}
                          readOnly
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">
                          Email
                        </Label>
                        <Input
                          id="email"
                          value={localStorage.getItem("email") || ""}
                          readOnly
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <SheetFooter>
                      <SheetClose asChild>
                        <Button variant={"destructive"} onClick={googleSignout}>
                          Logout
                        </Button>
                      </SheetClose>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
              </>
            ) : (
              <Button
                className="flex items-center rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-gray-100"
                onClick={() => navigate("/getstarted")}
              >
                Login / Signup
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
