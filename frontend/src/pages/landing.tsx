import { Features } from "@/components/features";
import { Hero } from "@/components/hero";
import { Navbar } from "@/components/navbar";
import { useEffect } from "react";
import { useNavigate } from "react-router";

export default function Landing() {
  const navigate = useNavigate();
  useEffect(() => {
    const idToken = localStorage.getItem("idToken") || "";
    if (idToken.length > 0) {
      navigate("/dashboard");
    } else {
      navigate("/");
    }
  }, []);
  return (
    <>
      <div className="min-h-screen bg-black">
        <Navbar />
        <main>
          <Hero />
          <Features />
        </main>
      </div>
    </>
  );
}
