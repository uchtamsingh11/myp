'use client';

import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Link from 'next/link';

export default function CookiesPolicy() {
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
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Home
            </Link>
          </div>
          
          <h1 className="text-4xl font-bold mb-8 text-center">Cookies Policy</h1>
          
          <div className="bg-zinc-900 p-8 rounded-xl">
            <h2 className="text-2xl font-bold mb-4">What Are Cookies</h2>
            <p className="text-zinc-300 mb-8">
              As is common practice with almost all professional websites, AlgoZ uses cookies, which are tiny files that are downloaded to your computer, to improve your experience. This page describes what information they gather, how we use it, and why we sometimes need to store these cookies. We will also share how you can prevent these cookies from being stored, however, this may downgrade or 'break' certain elements of the site's functionality.
            </p>
            
            <h2 className="text-2xl font-bold mb-4">How We Use Cookies</h2>
            <p className="text-zinc-300 mb-8">
              We use cookies for a variety of reasons detailed below. Unfortunately, in most cases, there are no industry standard options for disabling cookies without completely disabling the functionality and features they add to this site. It is recommended that you leave on all cookies if you are not sure whether you need them or not in case they are used to provide a service that you use.
            </p>
            
            <h2 className="text-2xl font-bold mb-4">The Cookies We Set</h2>
            <h3 className="text-xl font-semibold mt-6 mb-2">Account related cookies</h3>
            <p className="text-zinc-300 mb-4">
              If you create an account with us, we will use cookies for the management of the signup process and general administration. These cookies will usually be deleted when you log out, however in some cases they may remain afterward to remember your site preferences when logged out.
            </p>
            
            <h3 className="text-xl font-semibold mt-6 mb-2">Login related cookies</h3>
            <p className="text-zinc-300 mb-4">
              We use cookies when you are logged in so that we can remember this fact. This prevents you from having to log in every single time you visit a new page. These cookies are typically removed or cleared when you log out to ensure that you can only access restricted features and areas when logged in.
            </p>
            
            <h3 className="text-xl font-semibold mt-6 mb-2">Forms related cookies</h3>
            <p className="text-zinc-300 mb-4">
              When you submit data through a form such as those found on contact pages or comment forms, cookies may be set to remember your user details for future correspondence.
            </p>
            
            <h3 className="text-xl font-semibold mt-6 mb-2">Site preferences cookies</h3>
            <p className="text-zinc-300 mb-8">
              In order to provide you with a great experience on this site, we provide the functionality to set your preferences for how this site runs when you use it. In order to remember your preferences, we need to set cookies so that this information can be called whenever you interact with a page that is affected by your preferences.
            </p>
            
            <h2 className="text-2xl font-bold mb-4">Third-Party Cookies</h2>
            <p className="text-zinc-300 mb-4">
              In some special cases, we also use cookies provided by trusted third parties. The following section details which third-party cookies you might encounter through this site.
            </p>
            <p className="text-zinc-300 mb-4">
              This site uses Google Analytics which is one of the most widespread and trusted analytics solutions on the web for helping us to understand how you use the site and ways that we can improve your experience. These cookies may track things such as how long you spend on the site and the pages that you visit so we can continue to produce engaging content.
            </p>
            <p className="text-zinc-300 mb-4">
              From time to time, we test new features and make subtle changes to the way that the site is delivered. When we are still testing new features, these cookies may be used to ensure that you receive a consistent experience whilst on the site whilst ensuring we understand which optimizations our users appreciate the most.
            </p>
            <p className="text-zinc-300 mb-8">
              We also use social media buttons and/or plugins on this site that allow you to connect with your social network in various ways. For these to work, social media sites including Facebook, Twitter, and LinkedIn, will set cookies through our site which may be used to enhance your profile on their site or contribute to the data they hold for various purposes outlined in their respective privacy policies.
            </p>
            
            <h2 className="text-2xl font-bold mb-4">More Information</h2>
            <p className="text-zinc-300 mb-4">
              Hopefully, that has clarified things for you and as was previously mentioned if there is something that you aren't sure whether you need or not it's usually safer to leave cookies enabled in case it does interact with one of the features you use on our site.
            </p>
            <p className="text-zinc-300 mb-4">
              However, if you are still looking for more information, you can contact us through one of our preferred contact methods:
            </p>
            <ul className="list-disc pl-6 text-zinc-300">
              <li className="mb-2">Email: admin@algoz.tech</li>
              <li>Phone: +91 9214740350</li>
            </ul>
          </div>
        </motion.div>
      </div>
      
      <Footer />
    </main>
  );
} 