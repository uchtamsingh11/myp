'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import GradientText from '../../ui/effects/GradientText';
import BeamEffect from '../../ui/effects/BeamEffect';
import IntroducingBadge from '../../ui/badges/IntroducingBadge';

const Contact = () => {
        const [formData, setFormData] = useState({
                name: '',
                email: '',
                message: ''
        });
        const [isSubmitting, setIsSubmitting] = useState(false);
        const [submitStatus, setSubmitStatus] = useState(null);
        const [ref, inView] = useInView({
                triggerOnce: true,
                threshold: 0.1,
        });

        const handleChange = (e) => {
                const { name, value } = e.target;
                setFormData(prev => ({
                        ...prev,
                        [name]: value
                }));
        };

        const handleSubmit = async (e) => {
                e.preventDefault();
                setIsSubmitting(true);

                try {
                        // This would be replaced with your actual API endpoint
                        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call

                        // Success scenario
                        setSubmitStatus('success');
                        setFormData({ name: '', email: '', message: '' });

                        // Reset status after 5 seconds
                        setTimeout(() => {
                                setSubmitStatus(null);
                        }, 5000);
                } catch (error) {
                        setSubmitStatus('error');

                        // Reset error status after 5 seconds
                        setTimeout(() => {
                                setSubmitStatus(null);
                        }, 5000);
                } finally {
                        setIsSubmitting(false);
                }
        };

        return (
                <section id="contact" className="py-16 md:py-24 relative">
                        {/* Background elements */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-black"></div>

                        {/* Grid pattern overlay */}
                        <div className="absolute inset-0 grid-pattern opacity-[0.03]"></div>

                        {/* Beam effects */}
                        <BeamEffect
                                direction="horizontal"
                                count={2}
                                speed={20}
                                thickness={50}
                                color="bg-violet-500/5"
                        />

                        <div className="container-custom relative z-10">
                                <motion.div
                                        ref={ref}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                        transition={{ duration: 0.6 }}
                                        className="text-center mb-12"
                                >
                                        <div className="inline-block relative mb-6">
                                                <IntroducingBadge>
                                                        GET IN TOUCH
                                                </IntroducingBadge>
                                        </div>

                                        <h2 className="text-3xl md:text-5xl font-bold mb-6">
                                                <GradientText
                                                        gradient="purple"
                                                        className="inline"
                                                >
                                                        Contact Us
                                                </GradientText>
                                        </h2>

                                        <p className="text-zinc-400 text-lg max-w-3xl mx-auto">
                                                Have questions or need assistance? Reach out to our team and we'll get back to you as soon as possible.
                                        </p>
                                </motion.div>

                                <div className="max-w-4xl mx-auto">
                                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
                                                {/* Contact information */}
                                                <motion.div
                                                        className="lg:col-span-2"
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                                                        transition={{ duration: 0.5, delay: 0.2 }}
                                                >
                                                        <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-6 md:p-8">
                                                                <h3 className="text-xl font-semibold mb-6 text-white">Connect With Us</h3>

                                                                <div className="space-y-6">
                                                                        <div className="flex items-start">
                                                                                <div className="bg-zinc-800 p-2 rounded-full mr-4 text-violet-500">
                                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                                                        </svg>
                                                                                </div>
                                                                                <div>
                                                                                        <p className="font-medium text-white">Email</p>
                                                                                        <a href="mailto:support@algoz.com" className="text-zinc-400 hover:text-violet-400 transition-colors">
                                                                                                support@algoz.com
                                                                                        </a>
                                                                                </div>
                                                                        </div>

                                                                        <div className="flex items-start">
                                                                                <div className="bg-zinc-800 p-2 rounded-full mr-4 text-violet-500">
                                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                                                        </svg>
                                                                                </div>
                                                                                <div>
                                                                                        <p className="font-medium text-white">Phone</p>
                                                                                        <p className="text-zinc-400">+91 9241740350</p>
                                                                                </div>
                                                                        </div>

                                                                        <div className="flex items-start">
                                                                                <div className="bg-zinc-800 p-2 rounded-full mr-4 text-violet-500">
                                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                                        </svg>
                                                                                </div>
                                                                                <div>
                                                                                        <p className="font-medium text-white">Business Hours</p>
                                                                                        <p className="text-zinc-400">Mon-Fri: 9AM - 6PM IST</p>
                                                                                </div>
                                                                        </div>
                                                                </div>

                                                                <div className="mt-8 pt-6 border-t border-zinc-800">
                                                                        <h4 className="text-lg font-medium mb-4 text-white">Follow Us</h4>
                                                                        <div className="flex space-x-4">
                                                                                <a
                                                                                        href="https://youtube.com/@algo-zr?si=qnHugDNXo_3A5TJ2"
                                                                                        target="_blank"
                                                                                        rel="noopener noreferrer"
                                                                                        className="bg-zinc-800 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-violet-500/20 transition-colors"
                                                                                >
                                                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                                                                <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" />
                                                                                        </svg>
                                                                                </a>
                                                                                <a
                                                                                        href="https://t.me/AlgoZsupport1"
                                                                                        target="_blank"
                                                                                        rel="noopener noreferrer"
                                                                                        className="bg-zinc-800 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-violet-500/20 transition-colors"
                                                                                >
                                                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                                                                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12a12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                                                                                        </svg>
                                                                                </a>
                                                                                <a
                                                                                        href="https://wa.me/919241740350"
                                                                                        target="_blank"
                                                                                        rel="noopener noreferrer"
                                                                                        className="bg-zinc-800 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-violet-500/20 transition-colors"
                                                                                >
                                                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                                                                        </svg>
                                                                                </a>
                                                                        </div>
                                                                </div>
                                                        </div>
                                                </motion.div>

                                                {/* Contact form */}
                                                <motion.div
                                                        className="lg:col-span-3"
                                                        initial={{ opacity: 0, x: 20 }}
                                                        animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                                                        transition={{ duration: 0.5, delay: 0.2 }}
                                                >
                                                        <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-6 md:p-8">
                                                                <form onSubmit={handleSubmit}>
                                                                        <div className="grid grid-cols-1 gap-6">
                                                                                <div>
                                                                                        <label htmlFor="name" className="block mb-2 text-sm font-medium text-white">
                                                                                                Your Name
                                                                                        </label>
                                                                                        <input
                                                                                                type="text"
                                                                                                id="name"
                                                                                                name="name"
                                                                                                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent text-white placeholder-zinc-400"
                                                                                                placeholder="John Doe"
                                                                                                required
                                                                                                value={formData.name}
                                                                                                onChange={handleChange}
                                                                                        />
                                                                                </div>

                                                                                <div>
                                                                                        <label htmlFor="email" className="block mb-2 text-sm font-medium text-white">
                                                                                                Your Email
                                                                                        </label>
                                                                                        <input
                                                                                                type="email"
                                                                                                id="email"
                                                                                                name="email"
                                                                                                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent text-white placeholder-zinc-400"
                                                                                                placeholder="john@example.com"
                                                                                                required
                                                                                                value={formData.email}
                                                                                                onChange={handleChange}
                                                                                        />
                                                                                </div>

                                                                                <div>
                                                                                        <label htmlFor="message" className="block mb-2 text-sm font-medium text-white">
                                                                                                Your Message
                                                                                        </label>
                                                                                        <textarea
                                                                                                id="message"
                                                                                                name="message"
                                                                                                rows="4"
                                                                                                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent text-white placeholder-zinc-400"
                                                                                                placeholder="How can we help you?"
                                                                                                required
                                                                                                value={formData.message}
                                                                                                onChange={handleChange}
                                                                                        ></textarea>
                                                                                </div>

                                                                                <div>
                                                                                        <button
                                                                                                type="submit"
                                                                                                disabled={isSubmitting}
                                                                                                className={`w-full py-3 px-6 rounded-lg text-white font-medium transition-all 
                          ${isSubmitting ? 'bg-violet-700 cursor-not-allowed' : 'bg-violet-600 hover:bg-violet-700'} 
                          focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-900`}
                                                                                        >
                                                                                                {isSubmitting ? (
                                                                                                        <span className="flex items-center justify-center">
                                                                                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                                                                </svg>
                                                                                                                Sending...
                                                                                                        </span>
                                                                                                ) : 'Send Message'}
                                                                                        </button>
                                                                                </div>

                                                                                {submitStatus === 'success' && (
                                                                                        <div className="bg-green-500/10 border border-green-500/20 text-green-400 py-3 px-4 rounded-lg">
                                                                                                Thank you! Your message has been sent successfully.
                                                                                        </div>
                                                                                )}

                                                                                {submitStatus === 'error' && (
                                                                                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 py-3 px-4 rounded-lg">
                                                                                                There was an error sending your message. Please try again later.
                                                                                        </div>
                                                                                )}
                                                                        </div>
                                                                </form>
                                                        </div>
                                                </motion.div>
                                        </div>
                                </div>
                        </div>
                </section>
        );
};

export default Contact;
