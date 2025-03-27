'use client';

import { cn } from "@/lib/utils";
import { Marquee } from "@/components/magicui/marquee";

const reviews = [
  {
    name: "Rahul Sharma",
    username: "@rahul_trader",
    body: "The scalping tool has revolutionized my trading strategy. The real-time signals are incredibly accurate!",
    img: "https://avatar.vercel.sh/rahul",
  },
  {
    name: "Priya Patel",
    username: "@priya_invests",
    body: "I've seen a 40% improvement in my trading performance since using this platform. The UI is intuitive and powerful.",
    img: "https://avatar.vercel.sh/priya",
  },
  {
    name: "Amit Kumar",
    username: "@amit_trades",
    body: "The best trading tool I've used in my 5 years of trading. The support team is also very responsive.",
    img: "https://avatar.vercel.sh/amit",
  },
  {
    name: "Neha Gupta",
    username: "@neha_trader",
    body: "The automated signals have saved me countless hours of market analysis. Highly recommended!",
    img: "https://avatar.vercel.sh/neha",
  },
  {
    name: "Vikram Singh",
    username: "@vikram_trades",
    body: "The platform's performance is exceptional. I've been consistently profitable since I started using it.",
    img: "https://avatar.vercel.sh/vikram",
  },
  {
    name: "Anjali Reddy",
    username: "@anjali_invests",
    body: "The combination of technical analysis and real-time alerts is exactly what I needed. Game-changer!",
    img: "https://avatar.vercel.sh/anjali",
  },
];

const firstRow = reviews.slice(0, reviews.length / 2);
const secondRow = reviews.slice(reviews.length / 2);

const ReviewCard = ({
  img,
  name,
  username,
  body,
}: {
  img: string;
  name: string;
  username: string;
  body: string;
}) => {
  return (
    <figure
      className={cn(
        "relative h-full w-64 cursor-pointer overflow-hidden rounded-xl border p-4",
        // light styles
        "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
        // dark styles
        "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
      )}
    >
      <div className="flex flex-row items-center gap-2">
        <img className="rounded-full" width="32" height="32" alt="" src={img} />
        <div className="flex flex-col">
          <figcaption className="text-sm font-medium dark:text-white">
            {name}
          </figcaption>
          <p className="text-xs font-medium dark:text-white/40">{username}</p>
        </div>
      </div>
      <blockquote className="mt-2 text-sm">{body}</blockquote>
    </figure>
  );
};

export function Testimonials() {
  return (
    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden py-12">
      <h2 className="text-3xl font-bold mb-8 text-center">What Our Traders Say</h2>
      <Marquee pauseOnHover className="[--duration:20s]">
        {firstRow.map((review) => (
          <ReviewCard key={review.username} {...review} />
        ))}
      </Marquee>
      <Marquee reverse pauseOnHover className="[--duration:20s]">
        {secondRow.map((review) => (
          <ReviewCard key={review.username} {...review} />
        ))}
      </Marquee>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background"></div>
    </div>
  );
} 