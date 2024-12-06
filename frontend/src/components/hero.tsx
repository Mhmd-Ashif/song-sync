import { Sparkles, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";

export function Hero() {
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFadeIn(true);
    }, 500);
    return () => clearTimeout(timeout);
  }, []);
  return (
    <div className="relative isolate ">
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80 ">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem] " />
      </div>

      <div
        className={`mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 transition-opacity duration-1000 ease-in-out ${
          fadeIn ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-8 flex justify-center">
            <div
              className={`rounded-full bg-purple-100/10 px-3 py-1 text-sm font-medium leading-6 text-purple-200 ring-1 ring-inset ring-purple-500/20 transition-opacity duration-1000 ease-in-out ${
                fadeIn ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4" />
                <span>Introducing StreamSync</span>
              </div>
            </div>
          </div>
          <h1
            className={`text-4xl font-bold tracking-tight text-white sm:text-6xl transition-opacity duration-1000 ease-in-out ${
              fadeIn ? "opacity-100" : "opacity-0"
            }`}
          >
            Sync, Stream, and Share Music with Friends
          </h1>
          <p
            className={`mt-6 text-lg leading-8 text-gray-300 transition-opacity duration-1000 ease-in-out ${
              fadeIn ? "opacity-100" : "opacity-0"
            }`}
          >
            Join or create rooms, stream YouTube music videos together, and
            engage with friends through real-time upvotes and chats. The
            ultimate way to experience music together.
          </p>
          <div
            className={`mt-10 flex items-center justify-center gap-x-6 transition-opacity duration-1000 ease-in-out ${
              fadeIn ? "opacity-100" : "opacity-0"
            }`}
          >
            <button className="rounded-lg bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600">
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4" />
                <Link to={"/getstarted"}>Start Streaming Now</Link>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
