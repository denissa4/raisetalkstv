"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import VideoCard from '../../components/VideoCard';
import { supabase } from '@/lib/supabaseClient';

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

function LibraryContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [videos, setVideos] = useState<Video[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [myList, setMyList] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [processingPayment, setProcessingPayment] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  useEffect(() => {
    filterVideosByCategory();
  }, [selectedCategory, videos]);

  const checkAuthAndLoadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      // Check if user just came from Stripe checkout
      const sessionId = searchParams.get('session_id');
      
      // Try to find active subscription
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (!subscription) {
       
        if (sessionId) {
          setProcessingPayment(true);
          let attempts = 0;
          const maxAttempts = 10;
          
          const pollForSubscription = async (): Promise<boolean> => {
            const { data: sub } = await supabase
              .from('subscriptions')
              .select('*')
              .eq('user_id', session.user.id)
              .eq('status', 'active')
              .maybeSingle();
            
            if (sub) {
              setProcessingPayment(false);
              return true;
            }
            
            attempts++;
            if (attempts < maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, 2000));
              return pollForSubscription();
            }
            return false;
          };
          
          const found = await pollForSubscription();
          if (!found) {
            console.log('Subscription not found after polling, trying backup verification...');
            
            // Try to verify and create subscription directly from Stripe session
            try {
              const response = await fetch('/api/verify-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId }),
              });
              
              const result = await response.json();
              if (response.ok) {
                console.log('Subscription created via backup verification');
                setProcessingPayment(false);
              } else {
                console.error('Backup verification failed:', result.error || result);
                // Still proceed to show the page
                setProcessingPayment(false);
              }
            } catch (err) {
              console.error('Backup verification error:', err);
              setProcessingPayment(false);
            }
          }
        } else {
          router.push('/checkout');
          return;
        }
      }

      await loadVideos();
      loadMyList();
    } catch (error) {
      console.error('Error checking auth:', error);
      router.push('/login');
    }
  };

  const loadVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading videos:', error);
        setIsLoading(false);
        return;
      }

      if (data && data.length > 0) {
        setVideos(data);
        const uniqueCategories = ['All', ...Array.from(new Set(data.map(v => v.category)))];
        setCategories(uniqueCategories);
      } else {
        const sampleVideos: Video[] = [
          {
            id: '1',
            title: 'Epic Adventure',
            description: 'Join our heroes on an unforgettable journey through mystical lands filled with danger and wonder.',
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
          {
            id: '4',
            title: 'Space Odyssey',
            description: 'Explore the far reaches of the galaxy in this stunning sci-fi adventure.',
            thumbnail_url: 'https://picsum.photos/seed/video4/400/225',
            video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
            duration: 4500,
            category: 'Sci-Fi',
            created_at: new Date().toISOString(),
          },
          {
            id: '5',
            title: 'Comedy Night',
            description: 'Laugh out loud with this hilarious comedy special featuring top comedians.',
            thumbnail_url: 'https://picsum.photos/seed/video5/400/225',
            video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
            duration: 3000,
            category: 'Comedy',
            created_at: new Date().toISOString(),
          },
          {
            id: '6',
            title: 'Thriller Night',
            description: 'A psychological thriller that will keep you on the edge of your seat until the very end.',
            thumbnail_url: 'https://picsum.photos/seed/video6/400/225',
            video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
            duration: 6300,
            category: 'Thriller',
            created_at: new Date().toISOString(),
          },
          {
            id: '7',
            title: 'Documentary: Nature',
            description: 'Discover the wonders of the natural world in this breathtaking documentary series.',
            thumbnail_url: 'https://picsum.photos/seed/video7/400/225',
            video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
            duration: 5100,
            category: 'Documentary',
            created_at: new Date().toISOString(),
          },
          {
            id: '8',
            title: 'Action Hero',
            description: 'An action-packed blockbuster with incredible stunts and non-stop excitement.',
            thumbnail_url: 'https://picsum.photos/seed/video8/400/225',
            video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
            duration: 4800,
            category: 'Action',
            created_at: new Date().toISOString(),
          },
          {
            id: '9',
            title: 'Drama Series',
            description: 'A compelling drama about family, love, and the choices that define us.',
            thumbnail_url: 'https://picsum.photos/seed/video9/400/225',
            video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
            duration: 6600,
            category: 'Drama',
            created_at: new Date().toISOString(),
          },
          {
            id: '10',
            title: 'Horror House',
            description: 'Enter if you dare. A terrifying horror experience that will haunt your dreams.',
            thumbnail_url: 'https://picsum.photos/seed/video10/400/225',
            video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
            duration: 5700,
            category: 'Horror',
            created_at: new Date().toISOString(),
          },
          {
            id: '11',
            title: 'Fantasy Quest',
            description: 'Embark on a magical journey through enchanted realms and mythical creatures.',
            thumbnail_url: 'https://picsum.photos/seed/video11/400/225',
            video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
            duration: 7800,
            category: 'Fantasy',
            created_at: new Date().toISOString(),
          },
          {
            id: '12',
            title: 'Sports Highlights',
            description: 'The best moments from this season featuring incredible athletic performances.',
            thumbnail_url: 'https://picsum.photos/seed/video12/400/225',
            video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
            duration: 2700,
            category: 'Sports',
            created_at: new Date().toISOString(),
          },
        ];

        setVideos(sampleVideos);
        const uniqueCategories = ['All', ...Array.from(new Set(sampleVideos.map(v => v.category)))];
        setCategories(uniqueCategories);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error in loadVideos:', error);
      setIsLoading(false);
    }
  };

  const loadMyList = () => {
    const savedList = localStorage.getItem('myList');
    if (savedList) {
      setMyList(JSON.parse(savedList));
    }
  };

  const filterVideosByCategory = () => {
    if (selectedCategory === 'All') {
      setFilteredVideos(videos);
    } else {
      setFilteredVideos(videos.filter(video => video.category === selectedCategory));
    }
  };

  const handleAddToList = (id: string) => {
    const newList = [...myList, id];
    setMyList(newList);
    localStorage.setItem('myList', JSON.stringify(newList));
  };

  const handleRemoveFromList = (id: string) => {
    const newList = myList.filter(videoId => videoId !== id);
    setMyList(newList);
    localStorage.setItem('myList', JSON.stringify(newList));
  };

  if (isLoading || processingPayment) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center pt-20">
        <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mb-4"></div>
        {processingPayment && (
          <div className="text-center">
            <h2 className="text-xl font-semibold text-white mb-2">Processing Payment</h2>
            <p className="text-gray-400">Please wait while we confirm your subscription...</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pt-20 pb-12">
      <div className="container mx-auto px-4 md:px-8 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">Browse Library</h1>
            
            <div className="flex flex-wrap gap-3">
              {categories.map((category, index) => (
                <button
                  key={`category-${index}-${category}`}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 md:px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                    selectedCategory === category
                      ? 'bg-[var(--primary)] text-white scale-105'
                      : 'bg-[var(--secondary)] text-gray-300 hover:bg-[var(--muted)] hover:text-white'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {myList.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">My List</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {videos
                  .filter(video => myList.includes(video.id))
                  .map((video) => (
                    <VideoCard
                      key={video.id}
                      id={video.id}
                      title={video.title}
                      description={video.description}
                      thumbnailUrl={video.thumbnail_url}
                      duration={video.duration}
                      category={video.category}
                      isInList={true}
                      onRemoveFromList={handleRemoveFromList}
                    />
                  ))}
              </div>
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
              {selectedCategory === 'All' ? 'All Videos' : selectedCategory}
            </h2>
            
            {filteredVideos.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredVideos.map((video) => (
                  <VideoCard
                    key={video.id}
                    id={video.id}
                    title={video.title}
                    description={video.description}
                    thumbnailUrl={video.thumbnail_url}
                    duration={video.duration}
                    category={video.category}
                    isInList={myList.includes(video.id)}
                    onAddToList={handleAddToList}
                    onRemoveFromList={handleRemoveFromList}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No videos found in this category.</p>
              </div>
            )}
          </div>

          {selectedCategory === 'All' && (
            <>
              {categories.slice(1).map((category, index) => {
                const categoryVideos = videos.filter(v => v.category === category).slice(0, 5);
                if (categoryVideos.length === 0) return null;

                return (
                  <div key={`section-${index}-${category}`} className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl md:text-3xl font-bold text-white">{category}</h2>
                      <button
                        onClick={() => setSelectedCategory(category)}
                        className="text-[var(--primary)] hover:text-[var(--primary)]/80 font-semibold transition-colors"
                      >
                        View All
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {categoryVideos.map((video) => (
                        <VideoCard
                          key={video.id}
                          id={video.id}
                          title={video.title}
                          description={video.description}
                          thumbnailUrl={video.thumbnail_url}
                          duration={video.duration}
                          category={video.category}
                          isInList={myList.includes(video.id)}
                          onAddToList={handleAddToList}
                          onRemoveFromList={handleRemoveFromList}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default function LibraryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center pt-20">
        <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <LibraryContent />
    </Suspense>
  );
}