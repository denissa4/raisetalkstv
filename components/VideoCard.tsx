"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaPlay, FaPlus, FaCheck, FaChevronDown } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

interface VideoCardProps {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: number;
  category: string;
  isInList?: boolean;
  onAddToList?: (id: string) => void;
  onRemoveFromList?: (id: string) => void;
}

export default function VideoCard({
  id,
  title,
  description,
  thumbnailUrl,
  duration,
  category,
  isInList = false,
  onAddToList,
  onRemoveFromList,
}: VideoCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const router = useRouter();

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const handlePlay = () => {
    router.push(`/watch?id=${id}`);
  };

  const handleToggleList = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInList && onRemoveFromList) {
      onRemoveFromList(id);
    } else if (!isInList && onAddToList) {
      onAddToList(id);
    }
  };

  return (
    <motion.div
      className="relative group cursor-pointer"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="relative aspect-video rounded overflow-hidden bg-[var(--card)]"
        whileHover={{ scale: 1.05, zIndex: 10 }}
        transition={{ duration: 0.3 }}
      >
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--card)]">
            <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        <img
          src={thumbnailUrl}
          alt={title}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
          transition={{ duration: 0.3 }}
          className="absolute bottom-0 left-0 right-0 p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={handlePlay}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white hover:bg-white/90 transition-colors shadow-lg"
            >
              <FaPlay className="text-black text-xs ml-0.5" />
            </button>

            <button
              onClick={handleToggleList}
              className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-white/70 hover:border-white bg-black/30 hover:bg-black/50 transition-all"
            >
              {isInList ? (
                <FaCheck className="text-white text-xs" />
              ) : (
                <FaPlus className="text-white text-xs" />
              )}
            </button>

            <button
              onClick={handlePlay}
              className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-white/70 hover:border-white bg-black/30 hover:bg-black/50 transition-all ml-auto"
            >
              <FaChevronDown className="text-white text-xs" />
            </button>
          </div>

          <h3 className="text-white font-semibold text-sm mb-1 line-clamp-1">
            {title}
          </h3>

          <div className="flex items-center gap-2 text-xs text-gray-300">
            <span className="text-green-400 font-semibold">
              {Math.floor(Math.random() * 30) + 70}% Match
            </span>
            <span className="px-1.5 py-0.5 border border-gray-400 text-gray-300 text-[10px]">
              HD
            </span>
            <span>{formatDuration(duration)}</span>
          </div>
        </motion.div>

        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="px-2 py-1 bg-[var(--primary)] text-white text-xs font-semibold rounded">
            {category}
          </span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{
          opacity: isHovered ? 1 : 0,
          height: isHovered ? 'auto' : 0,
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="p-4 bg-[var(--card)] rounded-b shadow-xl -mt-1">
          <p className="text-gray-300 text-xs line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}