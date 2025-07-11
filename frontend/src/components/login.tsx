import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { app } from "@/firebase";
import { toast } from "sonner";
import axios from "axios";
import loadingToast from "./loading-toast";

export default function LoginPage() {
  const navigate = useNavigate();
  return (
    <div className="relative min-h-screen ">
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
      </div>

      <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Welcome to Sony Sync
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Stream YouTube music videos together without Delay
            </p>
          </div>

          <div className="mt-8 space-y-6 text-center">
            <div className="space-y-4 rounded-lg border border-gray-800 bg-black/50 p-6 backdrop-blur-xl">
              <GoogleButton />
              <Button variant={"secondary"} onClick={() => navigate("/")}>
                Go Back
              </Button>
            </div>
          </div>

          <p className="mt-2 text-center text-xs text-gray-400">
            By signing in, you agree to our{" "}
            <a
              href="#"
              className="font-medium text-purple-400 hover:text-purple-300"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="font-medium text-purple-400 hover:text-purple-300"
            >
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export function GoogleButton() {
  const provider = new GoogleAuthProvider();
  const auth = getAuth(app);
  const navigate = useNavigate();
  const handleGoogleSignIn = () => {
    console.log("Google sign-in clicked");

    signInWithPopup(auth, provider)
      .then(async (result) => {
        const idToken = await auth.currentUser?.getIdToken();
        const user = result.user;
        console.log(user);
        loadingToast("Logging In ...");
        const data = await axios.post(`${import.meta.env.VITE_ServerAPI}/user/check-user`, {
          name: user.displayName,
          email: user.email,
          uid: user.uid,
          idToken,
        });
        if (data.data.logged) {
          localStorage.setItem("idToken", idToken || "");
          localStorage.setItem("uid", user.uid || "");
          localStorage.setItem("displayName", user.displayName || "");
          localStorage.setItem("email", user.email || "");
          localStorage.setItem("photoURL", user.photoURL || "");
          toast("Logged Successfully");
          navigate("/dashboard");
        }
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        toast(errorMessage);
        console.log(errorCode, errorMessage);
      });
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      type="button"
      className="flex w-full items-center justify-center rounded-lg border border-gray-800 bg-black/30 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-black/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
    >
      <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
      Continue with Google
    </button>
  );
}
