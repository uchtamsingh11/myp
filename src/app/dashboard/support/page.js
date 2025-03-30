'use client';

import { ChevronRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useEffect } from 'react';

export default function SupportPage() {
  useEffect(() => {
    document.title = 'Support | AlgoZ';
  }, []);

  return (
    <div className="p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-white">Get in Touch</h1>
        <p className="text-xl text-zinc-400 mb-12">
          We're here to help. Reach out to us through any of these channels.
        </p>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12">
          {/* WhatsApp */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-600 transition-all duration-300 p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-black border border-zinc-700 flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17.6 6.32C16.27 4.98 14.46 4.23 12.55 4.23C8.63 4.23 5.44 7.42 5.44 11.34C5.44 12.59 5.77 13.81 6.39 14.87L5.36 18.78L9.36 17.77C10.39 18.33 11.55 18.63 12.73 18.63H12.74C16.65 18.63 19.84 15.44 19.84 11.52C19.84 9.61 19.09 7.8 17.6 6.32ZM12.55 17.46C11.5 17.46 10.47 17.18 9.57 16.65L9.33 16.5L7.05 17.12L7.68 14.89L7.52 14.64C6.93 13.71 6.62 12.63 6.62 11.52C6.62 8.07 9.27 5.41 12.73 5.41C14.33 5.41 15.83 6.03 16.95 7.16C18.07 8.29 18.69 9.79 18.68 11.39C18.67 14.85 16.01 17.46 12.55 17.46ZM15.84 12.95C15.62 12.84 14.53 12.31 14.33 12.24C14.13 12.17 13.99 12.13 13.84 12.35C13.69 12.57 13.28 13.07 13.16 13.21C13.04 13.36 12.91 13.38 12.69 13.27C11.66 12.76 11 12.37 10.33 11.2C10.12 10.86 10.46 10.88 10.78 10.25C10.85 10.1 10.81 9.97 10.76 9.86C10.71 9.75 10.38 8.66 10.2 8.21C10.03 7.78 9.85 7.84 9.72 7.83C9.6 7.82 9.46 7.82 9.31 7.82C9.16 7.82 8.92 7.87 8.72 8.09C8.52 8.31 7.96 8.84 7.96 9.93C7.96 11.02 8.76 12.08 8.87 12.22C8.98 12.37 10.37 14.49 12.47 15.44C13.44 15.87 13.99 16.01 14.42 16.11C15.1 16.28 15.71 16.26 16.19 16.2C16.73 16.14 17.61 15.67 17.79 15.15C17.97 14.63 17.97 14.18 17.92 14.1C17.87 14.02 17.73 13.97 17.51 13.86C17.29 13.75 16.06 13.06 15.84 12.95Z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">WhatsApp</h3>
              <p className="text-zinc-400 mb-4">Quick responses on WhatsApp</p>
              <Link
                href="https://wa.me/1234567890"
                target="_blank"
                className="inline-flex items-center text-zinc-300 hover:text-white"
              >
                <span>Chat Now</span>
                <ChevronRight className="ml-1 w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Telegram */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-600 transition-all duration-300 p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-black border border-zinc-700 flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16.64 8.8C16.49 10.38 15.84 14.22 15.51 15.99C15.37 16.74 15.09 16.99 14.83 17.02C14.25 17.07 13.81 16.64 13.25 16.27C12.37 15.69 11.87 15.33 11.02 14.77C10.03 14.12 10.67 13.76 11.24 13.18C11.39 13.03 13.95 10.7 14 10.49C14.0069 10.4476 14.0069 10.4043 14 10.362C13.9884 10.3208 13.9679 10.2834 13.94 10.253C13.9071 10.2243 13.8684 10.2032 13.8265 10.1909C13.7846 10.1786 13.7406 10.1756 13.697 10.182C13.63 10.182 13.55 10.213 13.46 10.27C13.35 10.34 11.89 11.34 9.07 13.28C8.75 13.5 8.46 13.61 8.19 13.6C7.89 13.59 7.32 13.42 6.89 13.28C6.37 13.11 5.96 13.02 6 12.73C6.02 12.58 6.23 12.43 6.62 12.28C9.61 10.98 11.59 10.13 12.57 9.72C15.41 8.51 16.07 8.24 16.5 8.24C16.59 8.24 16.78 8.26 16.9 8.36C17 8.44 17.03 8.55 17.04 8.63C17.04 8.68 17.05 8.73 17.05 8.8H16.64Z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Telegram</h3>
              <p className="text-zinc-400 mb-4">Connect with us on Telegram</p>
              <Link
                href="https://t.me/yourusername"
                target="_blank"
                className="inline-flex items-center text-zinc-300 hover:text-white"
              >
                <span>Message Us</span>
                <ChevronRight className="ml-1 w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Phone */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-600 transition-all duration-300 p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-black border border-zinc-700 flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M19.23 15.26L16.69 14.97C16.08 14.9 15.48 15.11 15.05 15.54L13.21 17.38C10.38 15.94 8.06 13.63 6.62 10.79L8.47 8.94C8.9 8.51 9.11 7.91 9.04 7.3L8.75 4.78C8.63 3.77 7.78 3.01 6.76 3.01H5.03C3.9 3.01 2.96 3.95 3.03 5.08C3.56 13.62 10.39 20.44 18.92 20.97C20.05 21.04 20.99 20.1 20.99 18.97V17.24C21 16.23 20.24 15.38 19.23 15.26Z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Phone</h3>
              <p className="text-zinc-400 mb-4">Call us directly</p>
              <Link
                href="tel:+1234567890"
                className="inline-flex items-center text-zinc-300 hover:text-white"
              >
                <span>+1 (234) 567-890</span>
                <ChevronRight className="ml-1 w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Email */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-600 transition-all duration-300 p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-black border border-zinc-700 flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Email</h3>
              <p className="text-zinc-400 mb-4">Send us an email</p>
              <Link
                href="mailto:support@algoz.com"
                className="inline-flex items-center text-zinc-300 hover:text-white"
              >
                <span>support@algoz.com</span>
                <ChevronRight className="ml-1 w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center mb-12">
          <h2 className="text-2xl font-bold mb-6">Need Immediate Assistance?</h2>
          <button className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-lg font-medium flex items-center mx-auto">
            <ExternalLink className="mr-2 h-5 w-5" />
            Live Chat Support
          </button>
          <p className="mt-4 text-zinc-500">Available 24/7 for all your support needs</p>
        </div>

      </div>
    </div>
  );
}
