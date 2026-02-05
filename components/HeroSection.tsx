"use client";

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaPlay, FaInfoCircle, FaVolumeMute, FaVolumeUp } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

interface HeroSectionProps {
  videoUrl?: string;
  title?: string;
  description?: string;
  showAuthButtons?: boolean;
}

export default function HeroSection({
  videoUrl = 'https://nlsqlstorage.blob.core.windows.net/videocontainer/raisetalks-tv-2k.mp4',
  title = 'Epic founders stories',
  description = 'Ready to watch? Sign up to get started.',
  showAuthButtons = true
}: HeroSectionProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => {
      setIsVideoLoaded(true);
      video.play().catch(error => {
        console.error('Auto-play failed:', error);
      });
    };

    video.addEventListener('canplay', handleCanPlay);

    setTimeout(() => {
      setShowContent(true);
    }, 500);

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, []);

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(!isMuted);
  };

  const handleSignUp = () => {
    router.push('/signup');
  };

  const handleLogin = () => {
    router.push('/login');
  };

  const handleWatchNow = () => {
    router.push('/library');
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div className="absolute inset-0 bg-[var(--background)]">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-cover opacity-0 transition-opacity duration-1000"
          style={{ opacity: isVideoLoaded ? 0.5 : 0 }}
          autoPlay
          muted={isMuted}
          loop
          playsInline
        />
        
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />
      </div>

      {!isVideoLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--background)]">
          <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showContent ? 1 : 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 h-full flex items-center"
      >
        <div className="container mx-auto px-4 md:px-8 lg:px-16">
          <div className="max-w-2xl">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 30 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 md:mb-6 leading-tight"
            >
              {title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 30 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-base md:text-lg lg:text-xl text-gray-300 mb-6 md:mb-8 leading-relaxed"
            >
              {description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 30 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              {showAuthButtons ? (
                <>
                  <button
                    onClick={handleSignUp}
                    className="flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-[var(--primary)] text-white text-base md:text-lg font-semibold rounded hover:bg-[var(--primary)]/90 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    <FaPlay className="text-sm md:text-base" />
                    Get Started
                  </button>

                  <button
                    onClick={handleLogin}
                    className="flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-white/20 text-white text-base md:text-lg font-semibold rounded hover:bg-white/30 transition-all duration-300 backdrop-blur-sm border border-white/30"
                  >
                    <FaInfoCircle className="text-sm md:text-base" />
                    Sign In
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleWatchNow}
                    className="flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-[var(--primary)] text-white text-base md:text-lg font-semibold rounded hover:bg-[var(--primary)]/90 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    <FaPlay className="text-sm md:text-base" />
                    Watch Now
                  </button>

                  <button
                    onClick={handleWatchNow}
                    className="flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-white/20 text-white text-base md:text-lg font-semibold rounded hover:bg-white/30 transition-all duration-300 backdrop-blur-sm border border-white/30"
                  >
                    <FaInfoCircle className="text-sm md:text-base" />
                    More Info
                  </button>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: showContent ? 1 : 0 }}
        transition={{ duration: 0.8, delay: 1 }}
        onClick={toggleMute}
        className="absolute bottom-24 md:bottom-32 right-4 md:right-8 lg:right-16 z-20 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full border-2 border-white/50 bg-black/30 hover:bg-black/50 transition-all duration-300 backdrop-blur-sm"
      >
        {isMuted ? (
          <FaVolumeMute className="text-white text-lg md:text-xl" />
        ) : (
          <FaVolumeUp className="text-white text-lg md:text-xl" />
        )}
      </motion.button>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--background)] to-transparent pointer-events-none" />
    </div>
  );
}