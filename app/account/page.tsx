"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaUser, FaCreditCard, FaSignOutAlt, FaEdit, FaCheck, FaTimes } from 'react-icons/fa';
import { supabase } from '@/lib/supabaseClient';

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url: string;
  created_at: string;
  updated_at: string;
}

interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  status: string;
  current_period_end: string;
  created_at: string;
  updated_at: string;
}

export default function AccountPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      setUserEmail(session.user.email || '');
      setUserId(session.user.id);

      await Promise.all([
        loadProfile(session.user.id),
        loadSubscription(session.user.id)
      ]);

      setIsLoading(false);
    } catch (error) {
      console.error('Error loading account data:', error);
      setIsLoading(false);
    }
  };

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        return;
      }

      if (data) {
        setProfile(data);
        setDisplayName(data.display_name || '');
      } else {
        
        const defaultDisplayName = userEmail.split('@')[0];
        try {
          const response = await fetch('/api/create-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: userId,
              displayName: defaultDisplayName,
            }),
          });

          if (response.ok) {
            // Reload profile after creation
            const { data: createdProfile } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('user_id', userId)
              .single();
            
            if (createdProfile) {
              setProfile(createdProfile);
              setDisplayName(createdProfile.display_name || '');
            }
          } else {
            const errorData = await response.json();
            console.error('Error creating profile:', errorData.error || 'Unknown error');
          }
        } catch (err) {
          console.error('Error creating profile:', err);
        }
      }
    } catch (error) {
      console.error('Error in loadProfile:', error);
    }
  };

  const loadSubscription = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading subscription:', error);
        return;
      }

      if (data) {
        setSubscription(data);
      }
    } catch (error) {
      console.error('Error in loadSubscription:', error);
    }
  };

  const handleSaveDisplayName = async () => {
    if (!profile || !displayName.trim()) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ display_name: displayName.trim(), updated_at: new Date().toISOString() })
        .eq('id', profile.id);

      if (error) {
        console.error('Error updating display name:', error);
        alert('Failed to update display name');
      } else {
        setProfile({ ...profile, display_name: displayName.trim() });
        setIsEditingName(false);
      }
    } catch (error) {
      console.error('Error saving display name:', error);
      alert('Failed to update display name');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setDisplayName(profile?.display_name || '');
    setIsEditingName(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;

    const confirmed = confirm('Are you sure you want to cancel your subscription? You will lose access to all content.');
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'canceled', updated_at: new Date().toISOString() })
        .eq('id', subscription.id);

      if (error) {
        console.error('Error canceling subscription:', error);
        alert('Failed to cancel subscription');
      } else {
        alert('Subscription canceled successfully');
        await loadSubscription(userId);
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      alert('Failed to cancel subscription');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'text-green-400';
      case 'canceled':
        return 'text-red-400';
      case 'past_due':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center pt-20">
        <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pt-20 pb-12">
      <div className="container mx-auto px-4 md:px-8 lg:px-16 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">Account Settings</h1>

          <div className="space-y-6">
            <div className="bg-[var(--card)] rounded-lg p-6 md:p-8 border border-[var(--border)]">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-[var(--primary)] flex items-center justify-center overflow-hidden">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <FaUser className="text-white text-3xl md:text-4xl" />
                    )}
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {isEditingName ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="flex-1 px-3 py-2 bg-[var(--input)] text-white border border-[var(--border)] rounded focus:border-[var(--primary)] outline-none"
                          placeholder="Display Name"
                        />
                        <button
                          onClick={handleSaveDisplayName}
                          disabled={isSaving}
                          className="w-10 h-10 flex items-center justify-center bg-green-600 hover:bg-green-700 rounded transition-colors disabled:opacity-50"
                        >
                          <FaCheck className="text-white" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          disabled={isSaving}
                          className="w-10 h-10 flex items-center justify-center bg-[var(--secondary)] hover:bg-[var(--muted)] rounded transition-colors disabled:opacity-50"
                        >
                          <FaTimes className="text-white" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <h2 className="text-xl md:text-2xl font-bold text-white">
                          {profile?.display_name || 'User'}
                        </h2>
                        <button
                          onClick={() => setIsEditingName(true)}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                        >
                          <FaEdit />
                        </button>
                      </>
                    )}
                  </div>
                  <p className="text-gray-400 mb-1">{userEmail}</p>
                  <p className="text-sm text-gray-500">
                    Member since {profile?.created_at ? formatDate(profile.created_at) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[var(--card)] rounded-lg p-6 md:p-8 border border-[var(--border)]">
              <div className="flex items-center gap-3 mb-6">
                <FaCreditCard className="text-[var(--primary)] text-2xl" />
                <h2 className="text-xl md:text-2xl font-bold text-white">Subscription</h2>
              </div>

              {subscription ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-[var(--border)]">
                    <span className="text-gray-400">Status</span>
                    <span className={`font-semibold capitalize ${getStatusColor(subscription.status)}`}>
                      {subscription.status}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-[var(--border)]">
                    <span className="text-gray-400">Plan</span>
                    <span className="text-white font-semibold">Premium</span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-[var(--border)]">
                    <span className="text-gray-400">Next billing date</span>
                    <span className="text-white font-semibold">
                      {formatDate(subscription.current_period_end)}
                    </span>
                  </div>

                  {subscription.status === 'active' && (
                    <button
                      onClick={handleCancelSubscription}
                      className="w-full mt-4 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded transition-colors"
                    >
                      Cancel Subscription
                    </button>
                  )}

                  {subscription.status === 'canceled' && (
                    <div className="mt-4 p-4 bg-yellow-600/20 border border-yellow-600/50 rounded">
                      <p className="text-yellow-400 text-sm">
                        Your subscription has been canceled. You will have access until {formatDate(subscription.current_period_end)}.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">No active subscription</p>
                  <button
                    onClick={() => router.push('/signup')}
                    className="px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white font-semibold rounded transition-colors"
                  >
                    Subscribe Now
                  </button>
                </div>
              )}
            </div>

            <div className="bg-[var(--card)] rounded-lg p-6 md:p-8 border border-[var(--border)]">
              <div className="flex items-center gap-3 mb-6">
                <FaSignOutAlt className="text-[var(--primary)] text-2xl" />
                <h2 className="text-xl md:text-2xl font-bold text-white">Account Actions</h2>
              </div>

              <button
                onClick={handleSignOut}
                className="w-full px-6 py-3 bg-[var(--secondary)] hover:bg-[var(--muted)] text-white font-semibold rounded transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}