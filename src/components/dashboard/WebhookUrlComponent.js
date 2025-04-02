'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../utils/supabase';
import { v4 as uuidv4 } from 'uuid';

export default function WebhookUrlComponent() {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const domain = 'https://algoz.tech';

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

      // First check if webhook_url exists in the profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        if (profileError.message.includes('does not exist')) {
          console.log('webhook_url column does not exist, creating webhook token manually');
          // Create a webhook token for the user
          const webhookToken = uuidv4();

          // Store it in profile using a different approach - we'll use profile.webhook_token
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ webhook_token: webhookToken })
            .eq('id', userId);

          if (updateError) {
            console.error('Failed to update profile with webhook token:', updateError);
            throw new Error('Unable to create your webhook URL. Please try again later.');
          }

          // Set the webhook URL using the newly created token
          setWebhookUrl(`${domain}/api/webhook/${webhookToken}`);
          setInitialDataLoaded(true);
          return;
        } else {
          console.error('Profile lookup error:', profileError);
          throw new Error(`Unable to retrieve your webhook URL. Please try again later.`);
        }
      }

      // Handle the case where we successfully retrieved the profile
      if (profile) {
        console.log('Profile data:', profile);

        // Check if webhook_url exists and has a value
        if (profile.webhook_url) {
          console.log('Found webhook_url in profile:', profile.webhook_url);
          setWebhookUrl(`${domain}/api/webhook/${profile.webhook_url}`);
        }
        // Try webhook_token instead if webhook_url doesn't exist
        else if (profile.webhook_token) {
          console.log('Found webhook_token in profile:', profile.webhook_token);
          setWebhookUrl(`${domain}/api/webhook/${profile.webhook_token}`);
        }
        // Create a new webhook token if neither exists
        else {
          console.log('No webhook identifiers found, creating one');
          const webhookToken = uuidv4();

          // Try to update with webhook_url first
          let updateResult = await supabase
            .from('profiles')
            .update({ webhook_url: webhookToken })
            .eq('id', userId);

          // If that fails due to column not existing, try webhook_token
          if (updateResult.error && updateResult.error.message.includes('does not exist')) {
            updateResult = await supabase
              .from('profiles')
              .update({ webhook_token: webhookToken })
              .eq('id', userId);
          }

          if (updateResult.error) {
            console.error('Failed to update profile with webhook token:', updateResult.error);
            throw new Error('Unable to create your webhook URL. Please try again later.');
          }

          setWebhookUrl(`${domain}/api/webhook/${webhookToken}`);
        }
      } else {
        throw new Error('Unable to retrieve your profile information. Please try again later.');
      }
      setInitialDataLoaded(true);
    } catch (err) {
      console.error('Error fetching webhook URL:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetComponentState = () => {
    setLoading(true);
    setError(null);
    setInitialDataLoaded(false);
  };

  useEffect(() => {
    // Only fetch webhook URL if it hasn't been loaded before
    if (!initialDataLoaded) {
      fetchWebhookUrl();
    } else {
      // If data was already loaded, just set loading to false
      setLoading(false);
    }
  }, [initialDataLoaded]);

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(webhookUrl)
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
    <div className="mx-auto p-6 bg-gradient-to-b from-zinc-950 to-zinc-900 rounded-xl shadow-xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center mb-6">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <svg className="w-5 h-5 mr-2 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Webhook URL
          </h2>
        </div>

        <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl p-6 mb-8 border border-zinc-800/50 shadow-lg">
          <p className="text-zinc-400 mb-4">
            Your unique webhook URL for TradingView integration. This URL is specific to your
            account and should be kept confidential.
          </p>

          {loading ? (
            <div className="flex items-center justify-center h-16">
              <div className="relative">
                <div className="w-6 h-6 rounded-full absolute border-2 border-solid border-zinc-800"></div>
                <div className="w-6 h-6 rounded-full animate-spin absolute border-2 border-solid border-indigo-500 border-t-transparent"></div>
              </div>
            </div>
          ) : error ? (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg">
              <div className="flex items-center mb-2">
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium">{error}</p>
              </div>
              <div className="flex justify-between items-center mt-2">
                <button
                  onClick={resetComponentState}
                  className="text-xs px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
                >
                  Retry Loading
                </button>
                <button className="text-xs underline" onClick={() => setError(null)}>
                  Dismiss
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
                  className={`px-4 py-3 rounded-r-lg transition-colors ${copied ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                >
                  {copied ? (
                    <span className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Copied!
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                        />
                      </svg>
                      Copy URL
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 border-t border-zinc-800 pt-6">
            <h3 className="text-lg font-semibold mb-3 text-white">How to Use Your Webhook URL</h3>
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
              <svg
                className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span>
                Keep your webhook URL confidential. Anyone with access to your URL can potentially
                execute trades on your behalf.
              </span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
