"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import HeroSection from '../components/HeroSection';
import { FaPlay, FaTv, FaMobileAlt, FaDownload } from 'react-icons/fa';
import { supabase } from '@/lib/supabaseClient';

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsAuthenticated(true);
        router.push('/library');
      } else {
        setIsLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setIsAuthenticated(true);
        router.push('/library');
      } else {
        setIsAuthenticated(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <HeroSection showAuthButtons={true} />

      <section className="py-16 md:py-24 bg-[var(--background)]">
        <div className="container mx-auto px-4 md:px-8 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid md:grid-cols-2 gap-8 md:gap-12 items-center mb-16 md:mb-24"
          >
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6">
                Create your own story!
              </h2>
              <p className="text-base md:text-lg text-gray-300 leading-relaxed">
                Subscribe and design your own founders story to stand out in front of investors!
              </p>
            </div>
            <div className="relative">
              <div className="relative aspect-video bg-gradient-to-br from-[var(--primary)]/20 to-purple-600/20 rounded-lg overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <FaTv className="text-white text-8xl md:text-9xl opacity-50" />
                </div>
                <img
                  src="https://picsum.photos/seed/tv/600/400"
                  alt="TV"
                  className="w-full h-full object-cover opacity-30"
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid md:grid-cols-2 gap-8 md:gap-12 items-center mb-16 md:mb-24"
          >
            <div className="order-2 md:order-1 relative">
              <div className="relative aspect-video bg-gradient-to-br from-blue-600/20 to-[var(--primary)]/20 rounded-lg overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <FaDownload className="text-white text-8xl md:text-9xl opacity-50" />
                </div>
                <img
                  src="https://picsum.photos/seed/download/600/400"
                  alt="Download"
                  className="w-full h-full object-cover opacity-30"
                />
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6">
                Upload your own founders story
              </h2>
              <p className="text-base md:text-lg text-gray-300 leading-relaxed">
                Standout with your own story in front of our investors.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid md:grid-cols-2 gap-8 md:gap-12 items-center mb-16 md:mb-24"
          >
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6">
                Watch everywhere
              </h2>
              <p className="text-base md:text-lg text-gray-300 leading-relaxed">
                Stream unlimited movies and TV shows on your phone, tablet, laptop, and TV without paying more.
              </p>
            </div>
            <div className="relative">
              <div className="relative aspect-video bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-lg overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <FaMobileAlt className="text-white text-8xl md:text-9xl opacity-50" />
                </div>
                <img
                  src="https://picsum.photos/seed/mobile/600/400"
                  alt="Mobile"
                  className="w-full h-full object-cover opacity-30"
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid md:grid-cols-2 gap-8 md:gap-12 items-center"
          >
            <div className="order-2 md:order-1 relative">
              <div className="relative aspect-video bg-gradient-to-br from-green-600/20 to-blue-600/20 rounded-lg overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <FaPlay className="text-white text-8xl md:text-9xl opacity-50" />
                </div>
                <img
                  src="https://picsum.photos/seed/kids/600/400"
                  alt="Kids"
                  className="w-full h-full object-cover opacity-30"
                />
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6">
                Create profiles for kids
              </h2>
              <p className="text-base md:text-lg text-gray-300 leading-relaxed">
                Send kids on adventures with their favorite characters in a space made just for themfree with your membership.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-[var(--card)]">
        <div className="container mx-auto px-4 md:px-8 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 md:mb-8">
              Frequently Asked Questions
            </h2>
            <div className="max-w-3xl mx-auto space-y-4">
              {[
                {
                  question: 'What is RaiseTalks.TV?',
                  answer: 'RaiseTalks.TV is a streaming service that offers a wide variety of award-winning TV shows, movies, anime, documentaries, and more on thousands of internet-connected devices.',
                },
                {
                  question: 'How much does RaiseTalks.TV cost?',
                  answer: 'Watch RaiseTalks.TV on your smartphone, tablet, Smart TV, laptop, or streaming device, all for one fixed monthly fee. Plans range from $9.99 to $19.99 a month. No extra costs, no contracts.',
                },
                {
                  question: 'Where can I watch?',
                  answer: 'Watch anywhere, anytime. Sign in with your RaiseTalks.TV account to watch instantly on the web at raisetalks.tv from your personal computer or on any internet-connected device.',
                },
                {
                  question: 'How do I cancel?',
                  answer: 'RaiseTalks.TV is flexible. There are no pesky contracts and no commitments. You can easily cancel your account online in two clicks. There are no cancellation fees  start or stop your account anytime.',
                },
              ].map((faq, index) => (
                <motion.details
                  key={index}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-[var(--secondary)] rounded overflow-hidden group"
                >
                  <summary className="px-6 py-5 text-left text-lg md:text-xl font-semibold text-white cursor-pointer hover:bg-[var(--muted)] transition-colors flex items-center justify-between">
                    {faq.question}
                    <span className="text-3xl group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <div className="px-6 py-5 text-base md:text-lg text-gray-300 border-t border-[var(--border)]">
                    {faq.answer}
                  </div>
                </motion.details>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-[var(--background)]">
        <div className="container mx-auto px-4 md:px-8 lg:px-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-6">
              Ready to watch? Sign up to get started.
            </h2>
            <button
              onClick={() => router.push('/signup')}
              className="px-8 md:px-12 py-3 md:py-4 bg-[var(--primary)] text-white text-lg md:text-xl font-semibold rounded hover:bg-[var(--primary)]/90 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Get Started
            </button>
          </motion.div>
        </div>
      </section>

      <footer className="py-12 bg-[var(--card)] border-t border-[var(--border)]">
        <div className="container mx-auto px-4 md:px-8 lg:px-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Social</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Facebook</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Instagram</a></li>
              </ul>
            </div>
          </div>
          <div className="text-center text-gray-500 text-sm">
            <p>&copy; 2024 RaiseTalks.TV. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}