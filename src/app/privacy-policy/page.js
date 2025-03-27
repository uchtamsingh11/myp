'use client';

import { motion } from 'framer-motion';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <main className="bg-black text-white min-h-screen">
      <Header />

      <div className="py-20 container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="mb-8 flex items-center">
            <Link
              href="/#footer"
              className="flex items-center text-zinc-400 hover:text-white transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Back to Home
            </Link>
          </div>

          <h1 className="text-4xl font-bold mb-8 text-center">Privacy Policy</h1>

          <div className="bg-zinc-900 p-8 rounded-xl">
            <h2 className="text-2xl font-bold mb-4">Introduction</h2>
            <p className="text-zinc-300 mb-6">
              At AlgoZ, we take your privacy seriously. This Privacy Policy explains how we collect,
              use, disclose, and safeguard your information when you visit our website and use our
              services.
            </p>
            <p className="text-zinc-300 mb-8">
              Please read this privacy policy carefully. If you do not agree with the terms of this
              privacy policy, please do not access the site.
            </p>

            <h2 className="text-2xl font-bold mb-4">Information We Collect</h2>
            <p className="text-zinc-300 mb-4">
              We may collect personal information that you voluntarily provide to us when you
              register on the website, express interest in obtaining information about us or our
              products and services, or otherwise contact us.
            </p>
            <p className="text-zinc-300 mb-4">
              The personal information that we collect depends on the context of your interactions
              with us and the website, the choices you make, and the products and features you use.
              The personal information we collect may include:
            </p>
            <ul className="list-disc pl-8 text-zinc-300 mb-8">
              <li className="mb-2">Name and contact data</li>
              <li className="mb-2">Credentials (password and similar security information)</li>
              <li className="mb-2">Payment data</li>
              <li className="mb-2">Usage data and preferences</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4">How We Use Your Information</h2>
            <p className="text-zinc-300 mb-4">
              We use personal information collected via our website for a variety of business
              purposes described below:
            </p>
            <ul className="list-disc pl-8 text-zinc-300 mb-8">
              <li className="mb-2">To provide and maintain our service</li>
              <li className="mb-2">To notify you about changes to our service</li>
              <li className="mb-2">
                To allow you to participate in interactive features of our service
              </li>
              <li className="mb-2">To provide customer support</li>
              <li className="mb-2">
                To gather analysis or valuable information so that we can improve our service
              </li>
              <li className="mb-2">To monitor the usage of our service</li>
              <li className="mb-2">To detect, prevent and address technical issues</li>
              <li className="mb-2">To fulfill any other purpose for which you provide it</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4">Disclosure of Your Information</h2>
            <p className="text-zinc-300 mb-4">
              We may share information we have collected about you in certain situations. Your
              information may be disclosed as follows:
            </p>
            <ul className="list-disc pl-8 text-zinc-300 mb-8">
              <li className="mb-2">
                <strong>By Law or to Protect Rights:</strong> If we believe the release of
                information about you is necessary to respond to legal process, to investigate or
                remedy potential violations of our policies, or to protect the rights, property, and
                safety of others, we may share your information as permitted or required by any
                applicable law, rule, or regulation.
              </li>
              <li className="mb-2">
                <strong>Third-Party Service Providers:</strong> We may share your information with
                third parties that perform services for us or on our behalf, including payment
                processing, data analysis, email delivery, hosting services, customer service, and
                marketing assistance.
              </li>
              <li className="mb-2">
                <strong>Marketing Communications:</strong> With your consent, or with an opportunity
                for you to withdraw consent, we may share your information with third parties for
                marketing purposes.
              </li>
              <li className="mb-2">
                <strong>Business Transfers:</strong> We may share or transfer your information in
                connection with, or during negotiations of, any merger, sale of company assets,
                financing, or acquisition of all or a portion of our business to another company.
              </li>
            </ul>

            <h2 className="text-2xl font-bold mb-4">Security of Your Information</h2>
            <p className="text-zinc-300 mb-8">
              We use administrative, technical, and physical security measures to help protect your
              personal information. While we have taken reasonable steps to secure the personal
              information you provide to us, please be aware that despite our efforts, no security
              measures are perfect or impenetrable, and no method of data transmission can be
              guaranteed against any interception or other type of misuse.
            </p>

            <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
            <p className="text-zinc-300">
              If you have questions or comments about this Privacy Policy, please contact us at:
            </p>
            <p className="text-zinc-300 mb-2">
              <strong>Email:</strong> admin@algoz.tech
            </p>
            <p className="text-zinc-300">
              <strong>Phone:</strong> +91 9214740350
            </p>
          </div>
        </motion.div>
      </div>

      <Footer />
    </main>
  );
}
