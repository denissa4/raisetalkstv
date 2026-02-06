"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaBell, FaUser, FaCaretDown, FaBars, FaTimes } from 'react-icons/fa';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Check authentication state
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setIsAuthenticated(true);
        setUserEmail(session.user.email || null);
      } else {
        setIsAuthenticated(false);
        setUserEmail(null);
      }
      setIsLoading(false);
    };
    
    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setIsAuthenticated(true);
        setUserEmail(session.user.email || null);
      } else {
        setIsAuthenticated(false);
        setUserEmail(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  // Check if we're on a public page
  const isPublicPage = ['/', '/login', '/signup'].includes(pathname);
  
  // Only show authenticated nav on protected pages
  const showAuthenticatedNav = isAuthenticated && !isPublicPage;

  const navLinks = showAuthenticatedNav
    ? [
        { name: 'Home', path: '/library' },
        { name: 'My List', path: '/my-list' },
        { name: 'Browse', path: '/browse' },
      ]
    : [
        { name: 'Home', path: '/' },
      ];

  const isActivePath = (path: string) => {
    return pathname === path;
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-[var(--background)]' : 'bg-gradient-to-b from-black/80 to-transparent'
      }`}
    >
      <div className="container mx-auto px-4 md:px-8 lg:px-16">
        <div className="flex items-center justify-between h-16 md:h-20">
          <div className="flex items-center gap-8">
            <button
              onClick={() => router.push(isAuthenticated ? '/library' : '/')}
              className="text-[var(--primary)] text-2xl md:text-3xl font-bold tracking-tight hover:scale-105 transition-transform"
            >
              RAISETALKS.TV
            </button>

            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => router.push(link.path)}
                  className={`text-sm font-medium transition-colors relative ${
                    isActivePath(link.path)
                      ? 'text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {link.name}
                  {isActivePath(link.path) && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[var(--primary)]"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            {isLoading ? (
              <div className="w-8 h-8 rounded bg-[var(--secondary)] animate-pulse"></div>
            ) : showAuthenticatedNav ? (
              <>
                <button className="hidden md:flex items-center justify-center w-9 h-9 text-white hover:text-gray-300 transition-colors">
                  <FaSearch className="text-lg" />
                </button>

                <button className="hidden md:flex items-center justify-center w-9 h-9 text-white hover:text-gray-300 transition-colors">
                  <FaBell className="text-lg" />
                </button>

                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2 group"
                  >
                    <div className="w-8 h-8 md:w-9 md:h-9 rounded bg-[var(--primary)] flex items-center justify-center">
                      <FaUser className="text-white text-sm" />
                    </div>
                    <FaCaretDown
                      className={`text-white text-sm transition-transform hidden md:block ${
                        showProfileMenu ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {showProfileMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-12 w-48 bg-[var(--card)] border border-[var(--border)] rounded shadow-xl overflow-hidden"
                      >
                        <div className="p-3 border-b border-[var(--border)]">
                          <p className="text-sm text-gray-300 truncate">{userEmail}</p>
                        </div>
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            router.push('/account');
                          }}
                          className="w-full px-4 py-3 text-left text-sm text-white hover:bg-[var(--secondary)] transition-colors"
                        >
                          Account
                        </button>
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            handleSignOut();
                          }}
                          className="w-full px-4 py-3 text-left text-sm text-white hover:bg-[var(--secondary)] transition-colors"
                        >
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <button
                onClick={() => router.push('/login')}
                className="px-4 md:px-6 py-2 bg-[var(--primary)] text-white text-sm font-semibold rounded hover:bg-[var(--primary)]/90 transition-colors"
              >
                Sign In
              </button>
            )}

            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden flex items-center justify-center w-9 h-9 text-white"
            >
              {showMobileMenu ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-[var(--background)] border-t border-[var(--border)]"
          >
            <div className="container mx-auto px-4 py-4">
              {navLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => {
                    router.push(link.path);
                    setShowMobileMenu(false);
                  }}
                  className={`block w-full text-left px-4 py-3 text-sm font-medium rounded transition-colors ${
                    isActivePath(link.path)
                      ? 'text-white bg-[var(--secondary)]'
                      : 'text-gray-300 hover:text-white hover:bg-[var(--secondary)]'
                  }`}
                >
                  {link.name}
                </button>
              ))}
              {showAuthenticatedNav && (
                <>
                  <button
                    onClick={() => {
                      router.push('/account');
                      setShowMobileMenu(false);
                    }}
                    className="block w-full text-left px-4 py-3 text-sm font-medium text-gray-300 hover:text-white hover:bg-[var(--secondary)] rounded transition-colors"
                  >
                    Account
                  </button>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setShowMobileMenu(false);
                    }}
                    className="block w-full text-left px-4 py-3 text-sm font-medium text-gray-300 hover:text-white hover:bg-[var(--secondary)] rounded transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}