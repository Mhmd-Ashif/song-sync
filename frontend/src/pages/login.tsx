import { Button } from "../components/ui/button";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import { app } from "../firebase";
import { useState } from "react";
import axios from "axios";
import { ServerAPI } from "../config";

export default function Login() {
  const provider = new GoogleAuthProvider();
  const auth = getAuth(app);

  const [token, isToken] = useState<string | undefined | null>();

  async function googleSignin() {
    signInWithPopup(auth, provider)
      .then(async (result) => {
        const idToken = await auth.currentUser?.getIdToken();
        console.log(idToken);
        localStorage.setItem("idToken", idToken || "");
        const user = result.user;
        isToken(idToken);
        console.log(user);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        alert("error");
        console.log(errorCode, errorMessage);
      });
  }

  function googleSignout() {
    signOut(auth)
      .then(() => {
        isToken(null);
      })
      .catch((error) => {
        console.log(error.message);
        alert("error logging out");
      });
  }

  async function validateUid() {
    const idToken = localStorage.getItem("idToken");
    try {
      const result = await axios.post(`${ServerAPI}/verified`, {
        idToken: idToken,
      });
      const data = await result.data;
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  }

  if (!token) {
    return (
      <>
        <Button onClick={googleSignin}>sign in with google</Button>
      </>
    );
  } else {
    return (
      <>
        <Button variant={"destructive"} onClick={googleSignout}>
          Logout
        </Button>
        <Button onClick={validateUid}>Validate your uid</Button>
      </>
    );
  }
}
