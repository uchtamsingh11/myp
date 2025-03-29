'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';
import GradientText from '../../ui/GradientText';
import GlowingText from '../../ui/GlowingText';
import Badge from '../../ui/Badge';
import Carousel from '../../ui/Carousel';
import BeamEffect from '../../ui/BeamEffect';
import IntroducingBadge from '../../ui/IntroducingBadge';

const testimonials = [
  {
    content:
      "This platform has transformed my trading. I was skeptical at first, but the results speak for themselves. I've seen a 27% increase in my portfolio over the last 3 months.",
    author: 'Sarah Johnson',
    role: 'Day Trader',
    image: '/images/testimonial-1.jpg',
    rating: 5,
    highlight: true,
  },
  {
    content:
      "The automation capabilities are incredible. I can finally sleep at night knowing my trading strategy is working 24/7 without me having to constantly monitor the markets.",
    author: 'Michael Chen',
    role: 'Crypto Investor',
    image: '/images/testimonial-2.jpg',
    rating: 5,
  },
  {
    content:
      "I was struggling to find time for trading alongside my full-time job. This platform has been a game-changer. Set it up once and it keeps working for you.",
    author: 'David Rodriguez',
    role: 'Part-time Trader',
    image: '/images/testimonial-3.jpg',
    rating: 4,
  },
  {
    content:
      "The risk management tools are what sold me. I can control exactly how much I'm willing to risk, and the platform respects those boundaries perfectly.",
    author: 'Emma Watson',
    role: 'Financial Analyst',
    image: '/images/testimonial-4.jpg',
    rating: 5,
    highlight: true,
  },
  {
    content:
      "Customer support is outstanding. Any time I've had a question or issue, they've responded quickly with helpful solutions. Couldn't ask for better service.",
    author: 'James Wilson',
    role: 'Retail Investor',
    image: '/images/testimonial-5.jpg',
    rating: 4,
  },
];

const TestimonialCard = ({ testimonial }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
      className="h-full flex flex-col"
    >
      <div className="flex-grow bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6 md:p-8 relative">
        {/* Highlight badge for special testimonials */}
        {testimonial.highlight && (
          <Badge
            variant="premium"
            className="absolute -top-3 -right-3"
            animated={true}
            glow={true}
          >
            Featured
          </Badge>
        )}

        {/* Rating stars */}
        <div className="flex mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg
              key={i}
              className={`w-5 h-5 ${i < testimonial.rating ? 'text-violet-500' : 'text-zinc-700'
                }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>

        {/* Quote mark */}
        <div className="absolute top-6 right-8 text-zinc-800 opacity-40">
          <svg
            className="w-16 h-16"
            fill="currentColor"
            viewBox="0 0 32 32"
            aria-hidden="true"
          >
            <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
          </svg>
        </div>

        {/* Content */}
        <p className="text-zinc-300 mb-6">{testimonial.content}</p>

        {/* Author info */}
        <div className="flex items-center mt-auto">
          <div className="relative w-12 h-12 rounded-full overflow-hidden">
            <Image
              src={testimonial.image}
              alt={testimonial.author}
              fill
              className="object-cover"
            />
          </div>
          <div className="ml-4">
            <GlowingText
              as="p"
              color={testimonial.highlight ? 'violet' : 'white'}
              className="font-semibold"
            >
              {testimonial.author}
            </GlowingText>
            <p className="text-zinc-500 text-sm">{testimonial.role}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Testimonials = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Group testimonials into slides for the carousel
  const testimonialSlides = [];
  for (let i = 0; i < testimonials.length; i += 2) {
    testimonialSlides.push(
      <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
        <TestimonialCard testimonial={testimonials[i]} />
        {testimonials[i + 1] && (
          <TestimonialCard testimonial={testimonials[i + 1]} />
        )}
      </div>
    );
  }

  return (
    <section id="testimonials" className="py-16 md:py-24 relative">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-black"></div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 grid-pattern opacity-[0.03]"></div>

      {/* Beam effect */}
      <BeamEffect
        direction="vertical"
        count={2}
        speed={20}
      />

      {/* Animated background blob */}
      <motion.div
        className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] opacity-20 bg-gradient-to-br from-violet-600/30 to-purple-600/30"
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="container-custom relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-block relative mb-6">
            <IntroducingBadge>TESTIMONIALS</IntroducingBadge>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-white">What Our </span>
            <span className="text-purple-500">Traders Say</span>
          </h2>

          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Don't just take our word for it. See what traders like you have accomplished
            with our algorithmic trading platform.
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          <Carousel
            autoPlay={true}
            interval={5000}
            showArrows={true}
            showDots={true}
            effect="slide"
            className="py-8"
          >
            {testimonialSlides}
          </Carousel>
        </div>

        <div className="mt-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex flex-col md:flex-row items-center justify-between md:gap-8 max-w-4xl mx-auto bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-6 md:p-10">
              <div className="flex items-center mb-6 md:mb-0 w-full md:w-1/3 justify-center">
                <span className="text-5xl md:text-6xl font-bold text-white mr-3">97%</span>
                <div className="text-left">
                  <Badge
                    variant="success"
                    size="sm"
                    className="mb-1"
                    style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', borderColor: 'rgba(16, 185, 129, 0.3)' }}
                  >
                    Verified
                  </Badge>
                  <p className="text-zinc-400 text-sm">
                    Customer<br />satisfaction
                  </p>
                </div>
              </div>

              <div className="flex items-center mb-6 md:mb-0 w-full md:w-1/3 justify-center">
                <span className="text-5xl md:text-6xl font-bold text-white mr-3">24/7</span>
                <div className="text-left">
                  <Badge
                    variant="warning"
                    size="sm"
                    className="mb-1"
                    style={{ backgroundColor: 'rgba(217, 119, 6, 0.2)', borderColor: 'rgba(217, 119, 6, 0.3)' }}
                  >
                    Always on
                  </Badge>
                  <p className="text-zinc-400 text-sm">
                    Support<br />available
                  </p>
                </div>
              </div>

              <div className="flex items-center w-full md:w-1/3 justify-center">
                <span className="text-5xl md:text-6xl font-bold text-white mr-3">15k+</span>
                <div className="text-left">
                  <Badge
                    variant="info"
                    size="sm"
                    className="mb-1"
                    style={{ backgroundColor: 'rgba(37, 99, 235, 0.2)', borderColor: 'rgba(37, 99, 235, 0.3)' }}
                  >
                    Growing
                  </Badge>
                  <p className="text-zinc-400 text-sm">
                    Active<br />traders
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
