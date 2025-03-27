'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../../src/utils/supabase';

export default function WebhookUrlComponent() {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);
  const domain = "https://algoz.tech";
  
  const fetchWebhookUrl = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error(`Unable to retrieve your webhook URL. Please try again later.`);
      }
      
      if (!sessionData?.session?.user?.id) {
        console.error('No session found');
        throw new Error('Please log in again to access your webhook URL.');
      }
      
      const userId = sessionData.session.user.id;
      console.log('User ID from session:', userId);
      
      // Directly query the profiles table
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('webhook_url, id')
        .eq('id', userId);
      
      if (profileError) {
        console.error('Profile lookup error:', profileError);
        throw new Error(`Unable to retrieve your webhook URL. Please try again later.`);
      }
      
      console.log('Profiles data:', profiles);
      
      if (!profiles || profiles.length === 0) {
        console.error('No profiles found for user ID:', userId);
        throw new Error('Unable to retrieve your webhook URL. Please try again later.');
      }
      
      // Use the first profile found
      const profile = profiles[0];
      console.log('Profile data:', profile);
      
      // Set the webhook URL
      if (profile.webhook_url) {
        console.log('Found webhook_url in profile:', profile.webhook_url);
        setWebhookUrl(`${domain}/api/webhook/${profile.webhook_url}`);
      } else {
        console.error('No webhook_url found in profile', profile);
        throw new Error('Unable to retrieve your webhook URL. Please try again later.');
      }
    } catch (err) {
      console.error('Error fetching webhook URL:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchWebhookUrl();
  }, []);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(webhookUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        setError('Failed to copy to clipboard');
      });
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold mb-6">TradingView Webhook URL</h2>
        
        <div className="bg-zinc-900 rounded-xl p-6 mb-8">
          <p className="text-zinc-400 mb-4">
            Your unique webhook URL for TradingView integration. This URL is specific to your account and should be kept confidential.
          </p>
          
          {loading ? (
            <div className="flex items-center justify-center h-16">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 mb-4 p-3 bg-red-900/20 rounded-lg">
              <p>{error}</p>
              <div className="mt-3">
                <p className="text-zinc-400 text-sm">
                  If this issue persists, please contact support.
                </p>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setLoading(true);
                    setError(null);
                    fetchWebhookUrl();
                  }}
                  disabled={loading}
                  className={`mt-3 px-4 py-2 ${loading ? 'bg-blue-800 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} rounded-lg text-sm flex items-center`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Loading...
                    </>
                  ) : (
                    'Retry'
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <label className="block text-zinc-400 text-sm mb-2">Your Webhook URL:</label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={webhookUrl}
                  readOnly
                  className="flex-grow bg-zinc-800 text-white p-3 rounded-l-lg border border-zinc-700 focus:outline-none"
                />
                <button
                  onClick={copyToClipboard}
                  className={`px-4 py-3 rounded-r-lg transition-colors ${
                    copied 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {copied ? (
                    <span className="flex items-center">
                      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      Copy URL
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}
          
          <div className="mt-6 border-t border-zinc-800 pt-6">
            <h3 className="text-lg font-semibold mb-3">How to Use Your Webhook URL</h3>
            <ol className="list-decimal list-inside space-y-3 text-zinc-400">
              <li>Copy the webhook URL above.</li>
              <li>Open TradingView and create or edit your strategy/alert.</li>
              <li>In the "Alert Actions" section, select "Webhook URL".</li>
              <li>Paste your webhook URL.</li>
              <li>Configure your payload format according to AlgoZ documentation.</li>
              <li>Save your alert/strategy settings.</li>
            </ol>
          </div>
          
          <div className="mt-6 bg-yellow-900/20 border border-yellow-800/50 rounded-lg p-4">
            <p className="text-yellow-300 text-sm flex items-start">
              <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Keep your webhook URL confidential. Anyone with access to your URL can potentially execute trades on your behalf.</span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 