'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import GradientText from '../ui/GradientText';
import GlowingText from '../ui/GlowingText';
import Badge from '../ui/Badge';

const links = {
  product: [
    { name: 'Features', href: '/#features' },
    { name: 'Pricing', href: '/#pricing' },
    { name: 'How It Works', href: '/#how-it-works' },
    { name: 'Testimonials', href: '/#testimonials' },
    { name: 'FAQ', href: '/#faq' },
  ],
  resources: [
    { name: 'Documentation', href: '/docs' },
    { name: 'API Reference', href: '/docs/api' },
    { name: 'Blog', href: '/blog' },
    { name: 'Tutorials', href: '/tutorials' },
    { name: 'Community', href: '/community' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Careers', href: '/careers' },
    { name: 'Contact Us', href: '/contact' },
    { name: 'Media Kit', href: '/media-kit' },
    { name: 'Partners', href: '/partners' },
  ],
  legal: [
    { name: 'Terms of Service', href: '/terms-conditions' },
    { name: 'Privacy Policy', href: '/privacy-policy' },
    { name: 'Cookie Policy', href: '/cookie-policy' },
    { name: 'Refund Policy', href: '/refund-policy' },
    { name: 'Disclaimer', href: '/disclaimer-policy' },
  ],
};

const socials = [
  {
    name: 'Twitter',
    href: 'https://twitter.com',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
      </svg>
    ),
  },
  {
    name: 'GitHub',
    href: 'https://github.com',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    name: 'Discord',
    href: 'https://discord.com',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286z" />
      </svg>
    ),
  },
  {
    name: 'YouTube',
    href: 'https://youtube.com',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
];

const Footer = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <footer className="bg-zinc-950 relative">
      {/* Background grid pattern */}
      <div className="absolute inset-0 grid-pattern opacity-[0.03]"></div>

      {/* Animated gradient top border */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-30"></div>

      <div className="container-custom pt-16 pb-8 relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 md:gap-12 pb-12 border-b border-zinc-800/50"
        >
          {/* Brand column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-6 lg:mb-0">
            <Link href="/" className="inline-block">
              <div className="flex items-center">
                <div className="mr-2 relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full blur-sm opacity-75"></div>
                  <div className="relative bg-zinc-900 rounded-full w-10 h-10 flex items-center justify-center">
                    <span className="text-white font-bold text-xl">A</span>
                  </div>
                </div>
                <GradientText
                  gradient="purple"
                  className="text-xl font-bold"
                >
                  AlgoZ
                </GradientText>
              </div>
            </Link>

            <p className="mt-4 text-zinc-400 text-sm">
              Empowering traders with cutting-edge algorithmic solutions to navigate volatile markets with confidence.
            </p>

            <div className="mt-6">
              <Badge variant="premium" animated={true}>
                Trusted by 15,000+ traders
              </Badge>
            </div>

            {/* Social links */}
            <div className="mt-6 flex space-x-4">
              {socials.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-400 hover:text-white transition-colors"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div>
            <h3 className="font-medium text-white mb-4">Product</h3>
            <ul className="space-y-3">
              {links.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-zinc-400 hover:text-white text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-white mb-4">Resources</h3>
            <ul className="space-y-3">
              {links.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-zinc-400 hover:text-white text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-white mb-4">Company</h3>
            <ul className="space-y-3">
              {links.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-zinc-400 hover:text-white text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-white mb-4">Legal</h3>
            <ul className="space-y-3">
              {links.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-zinc-400 hover:text-white text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Bottom section */}
        <div className="mt-8 pt-6 text-center text-zinc-500 text-sm">
          <p>
            &copy; {new Date().getFullYear()} AlgoZ. All rights reserved. Trading involves risk.
            <GlowingText
              className="inline-block ml-1"
              color="blue"
              disabled={true}
            >
              Made with ♥ for traders
            </GlowingText>
          </p>

          <div className="flex flex-wrap justify-center gap-6 mt-4">
            <Link href="/terms" className="hover:text-zinc-300 transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-zinc-300 transition-colors">Privacy</Link>
            <Link href="/security" className="hover:text-zinc-300 transition-colors">Security</Link>
            <Link href="/sitemap" className="hover:text-zinc-300 transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
