'use client';

import { cn } from "@/lib/utils.js";
import { RainbowButton } from "../../magicui/rainbow-button";

// Create the Marquee component since it's missing
const Marquee = ({
  children,
  className = "",
  reverse = false,
  pauseOnHover = false
}) => {
  return (
    <div
      className={cn(
        "flex w-full overflow-hidden [--duration:40s] [--gap:1rem]",
        className,
        pauseOnHover && "hover:[animation-play-state:paused]"
      )}
    >
      <div
        className={cn(
          "flex w-max animate-marquee items-stretch gap-[--gap]",
          reverse && "animate-marquee-reverse"
        )}
      >
        {children}
        {children}
      </div>
    </div>
  );
};

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
  {
    name: "Arjun Mehta",
    username: "@arjun_markets",
    body: "Been trading for 8 years and this platform has truly elevated my strategy. The order execution is lightning fast!",
    img: "https://avatar.vercel.sh/arjun",
  },
  {
    name: "Divya Joshi",
    username: "@divya_trades",
    body: "The copy trading feature has been a blessing for me as a beginner. I'm learning while earning!",
    img: "https://avatar.vercel.sh/divya",
  },
  {
    name: "Rajesh Khanna",
    username: "@rajesh_investor",
    body: "I appreciate how the platform integrates with multiple brokers. Switching from my old system was completely seamless.",
    img: "https://avatar.vercel.sh/rajesh",
  },
  {
    name: "Sunita Verma",
    username: "@sunita_fx",
    body: "The risk management tools are outstanding. I've been able to protect my capital while maximizing returns.",
    img: "https://avatar.vercel.sh/sunita",
  },
  {
    name: "Karan Malhotra",
    username: "@karan_bull",
    body: "AlgoZ's backtesting capabilities have transformed how I develop strategies. I can validate ideas before risking capital.",
    img: "https://avatar.vercel.sh/karan",
  },
  {
    name: "Meera Agarwal",
    username: "@meera_investor",
    body: "The mobile app is just as powerful as the desktop version. I can manage my trades from anywhere, anytime!",
    img: "https://avatar.vercel.sh/meera",
  },
  {
    name: "Vivek Nair",
    username: "@vivek_daytrader",
    body: "As a day trader, speed is everything. This platform's execution is milliseconds faster than others I've tried.",
    img: "https://avatar.vercel.sh/vivek",
  },
  {
    name: "Ananya Desai",
    username: "@ananya_markets",
    body: "I love the customizable alerts. They've helped me catch moves I would have otherwise missed while at my day job.",
    img: "https://avatar.vercel.sh/ananya",
  },
  {
    name: "Sanjay Kapoor",
    username: "@sanjay_options",
    body: "The options analysis tools have completely changed my derivatives trading. The P&L calculator is spot on!",
    img: "https://avatar.vercel.sh/sanjay",
  },
  {
    name: "Pooja Sharma",
    username: "@pooja_techtrader",
    body: "The educational resources provided alongside the tools have improved my technical analysis skills tremendously.",
    img: "https://avatar.vercel.sh/pooja",
  },
];

const firstRow = reviews.slice(0, reviews.length / 2);
const secondRow = reviews.slice(reviews.length / 2);

const ReviewCard = function (props) {
  const { img, name, username, body } = props;
  return (
    <figure
      className={cn(
        "relative h-full w-72 cursor-pointer overflow-hidden rounded-xl border p-6",
        // light styles
        "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
        // dark styles
        "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
      )}
    >
      <div className="flex flex-row items-center gap-3">
        <img className="rounded-full w-10 h-10" width="40" height="40" alt="" src={img} />
        <div className="flex flex-col">
          <figcaption className="text-base font-medium dark:text-white">
            {name}
          </figcaption>
          <p className="text-sm font-medium dark:text-white/40">{username}</p>
        </div>
      </div>
      <blockquote className="mt-4 text-base leading-relaxed">{body}</blockquote>
    </figure>
  );
};

const Testimonials = () => {
  return (
    <section className="py-20 sm:py-28 bg-zinc-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,_var(--tw-gradient-stops))] from-transparent via-zinc-900/20 to-transparent"></div>

      {/* Decorative elements */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-indigo-600/10 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-1/4 right-10 w-72 h-72 bg-indigo-500/5 rounded-full filter blur-3xl"></div>

      <div className="container-custom relative z-10">
        <div className="text-center mb-12 md:mb-20">
          <h2 className="section-title text-3xl md:text-4xl">What Our Traders Say</h2>
          <p className="section-subtitle text-base md:text-lg max-w-3xl mx-auto mt-4">
            Join thousands of satisfied traders who have elevated their trading with AlgoZ.
          </p>
        </div>

        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden py-4">
          <Marquee pauseOnHover className="[--duration:25s] mb-6">
            {firstRow.map((review) => (
              <ReviewCard key={review.username} {...review} />
            ))}
          </Marquee>
          <Marquee reverse pauseOnHover className="[--duration:25s]">
            {secondRow.map((review) => (
              <ReviewCard key={review.username} {...review} />
            ))}
          </Marquee>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-zinc-950 to-transparent"></div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-zinc-950 to-transparent"></div>
        </div>

        <div className="mt-10 text-center">
          <a href="#pricing">
            <RainbowButton>
              <span className="flex items-center">
                Join Our Traders
                <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </span>
            </RainbowButton>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
