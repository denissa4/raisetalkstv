"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import VideoPlayer from '../../components/VideoPlayer';
import { supabase } from '@/lib/supabaseClient';
import { FaArrowLeft, FaPlay, FaPlus, FaCheck } from 'react-icons/fa';

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  video_url: string;
  duration: number;
  category: string;
  created_at: string;
}

function WatchPageContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [video, setVideo] = useState<Video | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
  const [isInList, setIsInList] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const videoId = searchParams.get('id');

  useEffect(() => {
    checkAuthAndLoadVideo();
  }, [videoId]);

  const checkAuthAndLoadVideo = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .single();

      if (!subscription) {
        router.push('/signup');
        return;
      }

      if (!videoId) {
        router.push('/library');
        return;
      }

      await loadVideo(videoId);
      checkIfInList(videoId);
    } catch (error) {
      console.error('Error checking auth:', error);
      router.push('/login');
    }
  };

  const loadVideo = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        const sampleVideos: Video[] = [
          {
            id: '1',
            title: 'Epic Adventure',
            description: 'Join our heroes on an unforgettable journey through mystical lands filled with danger and wonder. This epic tale spans across multiple kingdoms and features breathtaking cinematography.',
            thumbnail_url: 'https://picsum.photos/seed/video1/400/225',
            video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            duration: 3600,
            category: 'Action',
            created_at: new Date().toISOString(),
          },
          {
            id: '2',
            title: 'Mystery Manor',
            description: 'A detective must solve a series of puzzles in a haunted mansion before time runs out.',
            thumbnail_url: 'https://picsum.photos/seed/video2/400/225',
            video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            duration: 5400,
            category: 'Mystery',
            created_at: new Date().toISOString(),
          },
          {
            id: '3',
            title: 'Love in Paris',
            description: 'Two strangers meet in the city of love and discover that fate has brought them together.',
            thumbnail_url: 'https://picsum.photos/seed/video3/400/225',
            video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            duration: 7200,
            category: 'Romance',
            created_at: new Date().toISOString(),
          },
        ];

        const foundVideo = sampleVideos.find(v => v.id === id);
        if (foundVideo) {
          setVideo(foundVideo);
          const related = sampleVideos.filter(v => v.id !== id && v.category === foundVideo.category);
          setRelatedVideos(related);
        } else {
          router.push('/library');
          return;
        }
      } else {
        setVideo(data);
        await loadRelatedVideos(data.category, id);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error loading video:', error);
      router.push('/library');
    }
  };

  const loadRelatedVideos = async (category: string, currentId: string) => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('category', category)
        .neq('id', currentId)
        .limit(6);

      if (error) {
        console.error('Error loading related videos:', error);
        return;
      }

      if (data) {
        setRelatedVideos(data);
      }
    } catch (error) {
      console.error('Error in loadRelatedVideos:', error);
    }
  };

  const checkIfInList = (id: string) => {
    const savedList = localStorage.getItem('myList');
    if (savedList) {
      const myList = JSON.parse(savedList);
      setIsInList(myList.includes(id));
    }
  };

  const toggleList = () => {
    if (!videoId) return;

    const savedList = localStorage.getItem('myList');
    let myList: string[] = savedList ? JSON.parse(savedList) : [];

    if (isInList) {
      myList = myList.filter(id => id !== videoId);
    } else {
      myList.push(videoId);
    }

    localStorage.setItem('myList', JSON.stringify(myList));
    setIsInList(!isInList);
  };

  const handleVideoClick = (id: string) => {
    router.push(`/watch?id=${id}`);
  };

  const handleBack = () => {
    router.push('/library');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Video not found</p>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-[var(--primary)] text-white font-semibold rounded hover:bg-[var(--primary)]/90 transition-colors"
          >
            Back to Library
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="relative w-full h-screen">
        <VideoPlayer
          videoUrl={video.video_url}
          title={video.title}
          onClose={handleBack}
        />
      </div>

      <div className="container mx-auto px-4 md:px-8 lg:px-16 py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
          >
            <FaArrowLeft />
            <span>Back to Library</span>
          </button>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="md:col-span-2">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{video.title}</h1>
              
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <span className="px-3 py-1 bg-[var(--primary)] text-white text-sm font-semibold rounded">
                  {video.category}
                </span>
                <span className="text-green-400 font-semibold">
                  {Math.floor(Math.random() * 30) + 70}% Match
                </span>
                <span className="text-gray-400">
                  {Math.floor(video.duration / 60)} min
                </span>
                <span className="px-2 py-1 border border-gray-400 text-gray-300 text-xs">
                  HD
                </span>
              </div>

              <p className="text-gray-300 text-base md:text-lg leading-relaxed mb-6">
                {video.description}
              </p>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded hover:bg-white/90 transition-colors"
                >
                  <FaPlay />
                  <span>Play Again</span>
                </button>

                <button
                  onClick={toggleList}
                  className="flex items-center gap-2 px-6 py-3 bg-[var(--secondary)] text-white font-semibold rounded hover:bg-[var(--muted)] transition-colors"
                >
                  {isInList ? <FaCheck /> : <FaPlus />}
                  <span>{isInList ? 'In My List' : 'Add to List'}</span>
                </button>
              </div>
            </div>

            <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)] h-fit">
              <h3 className="text-xl font-bold text-white mb-4">Details</h3>
              
              <div className="space-y-3">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Genre</p>
                  <p className="text-white">{video.category}</p>
                </div>

                <div>
                  <p className="text-gray-500 text-sm mb-1">Duration</p>
                  <p className="text-white">{Math.floor(video.duration / 60)} minutes</p>
                </div>

                <div>
                  <p className="text-gray-500 text-sm mb-1">Release Date</p>
                  <p className="text-white">
                    {new Date(video.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 text-sm mb-1">Rating</p>
                  <p className="text-white">PG-13</p>
                </div>
              </div>
            </div>
          </div>

          {relatedVideos.length > 0 && (
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">More Like This</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {relatedVideos.map((relatedVideo) => (
                  <motion.div
                    key={relatedVideo.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="cursor-pointer group"
                    onClick={() => handleVideoClick(relatedVideo.id)}
                  >
                    <div className="relative aspect-video rounded overflow-hidden bg-[var(--card)] mb-2">
                      <img
                        src={relatedVideo.thumbnail_url}
                        alt={relatedVideo.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                        <FaPlay className="text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    </div>
                    <h3 className="text-white font-semibold text-sm line-clamp-1 mb-1">
                      {relatedVideo.title}
                    </h3>
                    <p className="text-gray-400 text-xs">
                      {Math.floor(relatedVideo.duration / 60)} min
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default function WatchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <WatchPageContent />
    </Suspense>
  );
}