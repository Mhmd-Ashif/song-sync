import {
  Users,
  PlayCircle,
  ThumbsUp,
  Fingerprint,
} from "lucide-react";
import { useState } from "react";
import { InView } from "react-intersection-observer";

const features = [
  {
    name: "Create Rooms",
    description:
      "Host your own music sessions by creating a room for friends to join.",
    icon: Users,
  },
  {
    name: "Stream Together",
    description:
      "Watch and listen to YouTube videos in sync with everyone in the room.",
    icon: PlayCircle,
  },
  {
    name: "Real Time Sync",
    description:
      "Sync Video Between the Users without much latency and high load",
    icon: ThumbsUp,
  },
  {
    name: "Secure Login Via OAuth",
    description:
      "No data will be stored or seen though it is complete managed by Google",
    icon: Fingerprint,
  },
];

export function Features() {
  return (
    <div className="py-4 sm:py-18 sm:mb-20 ">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center ">
          <h2 className="text-base font-semibold leading-7 text-purple-400">
            Listen Together
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Experience Music Like Never Before
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            Create rooms, stream your favorite YouTube tracks, and connect with
            friends in real-time. Sync, chat, and share the joy of music
            together.
          </p>
        </div>

        <div className="mx-auto mt-12  max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none mb-5 sm:mb-0">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
            {features.map((feature:any, index:any) => (
              <FeatureItem key={feature.name} index={index} feature={feature} />
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ feature, index }: any) {
  const [fadeIn, setFadeIn] = useState(false);

  return (
    <div className="flex flex-col">
      <InView
        as="div"
        onChange={(inView) => {
          if (inView) {
            setFadeIn(true);
          } else {
            setFadeIn(false);
          }
        }}
        triggerOnce
        rootMargin="0px 0px -50px 0px"
      >
        <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
          <feature.icon
            className="h-5 w-5 flex-none text-purple-400"
            aria-hidden="true"
          />
          {feature.name}
        </dt>
        <dd
          className={`mt-4 flex flex-auto flex-col text-base leading-7 text-gray-400 transition-transform duration-1000 ease-in-out ${
            fadeIn
              ? `transform opacity-100 scale-100 translate-y-0 delay-[${
                  index * 200
                }ms]`
              : `transform opacity-0 scale-95 translate-y-10`
          }`}
        >
          <p className="flex-auto">{feature.description}</p>
        </dd>
      </InView>
    </div>
  );
}
