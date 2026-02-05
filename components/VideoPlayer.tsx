"use client";

import { useState, useRef, useEffect } from 'react';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaExpand, FaCompress, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  onClose?: () => void;
}

export default function VideoPlayer({ videoUrl, title, onClose }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = parseFloat(e.target.value);
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;

    try {
      if (!isFullscreen) {
        await container.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const handleVideoClick = () => {
    togglePlay();
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-[var(--background)] flex items-center justify-center"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-contain cursor-pointer"
        onClick={handleVideoClick}
      />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--background)]">
          <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 pointer-events-none"
          >
            <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between pointer-events-auto">
              <h2 className="text-2xl font-bold text-white">{title}</h2>
              {onClose && (
                <button
                  onClick={onClose}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                >
                  <FaTimes className="text-white text-xl" />
                </button>
              )}
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-auto">
              <div className="mb-4">
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1 bg-[var(--muted)] rounded-lg appearance-none cursor-pointer accent-[var(--primary)] hover:h-2 transition-all"
                  style={{
                    background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${(currentTime / duration) * 100}%, var(--muted) ${(currentTime / duration) * 100}%, var(--muted) 100%)`
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={togglePlay}
                    className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    {isPlaying ? (
                      <FaPause className="text-white text-xl" />
                    ) : (
                      <FaPlay className="text-white text-xl ml-1" />
                    )}
                  </button>

                  <div className="flex items-center gap-2 group">
                    <button
                      onClick={toggleMute}
                      className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                    >
                      {isMuted ? (
                        <FaVolumeMute className="text-white text-lg" />
                      ) : (
                        <FaVolumeUp className="text-white text-lg" />
                      )}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-0 group-hover:w-20 h-1 bg-[var(--muted)] rounded-lg appearance-none cursor-pointer accent-white transition-all duration-300"
                    />
                  </div>

                  <span className="text-white text-sm font-medium">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <button
                  onClick={toggleFullscreen}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                >
                  {isFullscreen ? (
                    <FaCompress className="text-white text-lg" />
                  ) : (
                    <FaExpand className="text-white text-lg" />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isPlaying && !isLoading && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          onClick={togglePlay}
          className="absolute inset-0 m-auto w-20 h-20 flex items-center justify-center rounded-full bg-[var(--primary)] hover:bg-[var(--primary)]/90 transition-colors shadow-2xl"
        >
          <FaPlay className="text-white text-3xl ml-2" />
        </motion.button>
      )}
    </div>
  );
}