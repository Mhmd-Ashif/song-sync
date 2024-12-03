import "./App.css";
import { Button } from "./components/ui/button";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import { app } from "./firebase";
import { useState } from "react";

function App() {
  const provider = new GoogleAuthProvider();
  const auth = getAuth(app);

  const [token, isToken] = useState<string | undefined | null>();

  function googleSignin() {
    signInWithPopup(auth, provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken;
        // The signed-in user info.
        const user = result.user;
        isToken(token);
        console.log(token);
        console.log(user);
        // IdP data available using getAdditionalUserInfo(result)
        // ...
      })
      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        alert("error");
        console.log(errorMessage);
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
      });
  }

  function googleSignout() {
    signOut(auth)
      .then(() => {
        // Sign-out successful.
        isToken(null);
      })
      .catch((error) => {
        // An error happened.
        alert("error logging out");
      });
  }

  if (!token) {
    return (
      <>
        <Button onClick={googleSignin}>sign in with google</Button>
      </>
    );
  } else {
    return (
      <Button variant={"destructive"} onClick={googleSignout}>
        Logout
      </Button>
    );
  }
}

export default App;
