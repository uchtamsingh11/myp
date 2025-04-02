'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../../utils/supabase';   
import { getCurrentUserProfile } from '../../../lib/auth/profile';

export default function WebhookLogsComponent() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedLog, setExpandedLog] = useState(null);
  const [nextCleanupTime, setNextCleanupTime] = useState(null);

  useEffect(() => {
    const fetchWebhookLogs = async () => {
      try {
        setLoading(true);

        // Get current user profile
        const profile = await getCurrentUserProfile();

        if (!profile) {
          throw new Error('Could not retrieve user profile');
        }

        // Fetch webhook logs for the user
        const { data, error } = await supabase
          .from('webhook_logs')
          .select('*')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(100);

        if (error) throw error;

        setLogs(data || []);
      } catch (err) {
        console.error('Error fetching webhook logs:', err);
        setError('Failed to retrieve your webhook logs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchWebhookLogs();

    // Set up real-time subscription for webhook logs
    const setupSubscription = async () => {
      const profile = await getCurrentUserProfile();

      if (!profile) return null;

      const subscription = supabase
        .channel('webhook-logs-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'webhook_logs',
            filter: `user_id=eq.${profile.id}`,
          },
          payload => {
            // Update logs when a new log is added
            setLogs(currentLogs => [payload.new, ...currentLogs].slice(0, 100));
          }
        )
        .subscribe();

      return subscription;
    };

    let subscription;
    setupSubscription().then(sub => {
      subscription = sub;
    });

    // Set up log cleanup at midnight IST
    const calculateNextMidnightIST = () => {
      // IST is UTC+5:30
      const now = new Date();
      // Create a date object for India time zone (IST)
      const istOptions = { timeZone: 'Asia/Kolkata' };
      const istDateString = now.toLocaleString('en-US', istOptions);
      const istDate = new Date(istDateString);

      // Set the time to the next midnight
      const nextMidnight = new Date(istDate);
      nextMidnight.setHours(24, 0, 0, 0);

      // Convert back to user's local time
      const istOffsetHours = 5;
      const istOffsetMinutes = 30;
      const userOffsetMinutes = now.getTimezoneOffset();
      const differenceMinutes = userOffsetMinutes + (istOffsetHours * 60 + istOffsetMinutes);

      const localNextMidnight = new Date(nextMidnight.getTime() - differenceMinutes * 60 * 1000);
      return localNextMidnight;
    };

    const scheduleLogCleanup = () => {
      const nextMidnight = calculateNextMidnightIST();
      setNextCleanupTime(nextMidnight);

      // Calculate milliseconds until midnight IST
      const now = new Date();
      const msUntilMidnight = nextMidnight.getTime() - now.getTime();

      console.log(`Scheduling log cleanup in ${msUntilMidnight / (1000 * 60)} minutes`);

      // Schedule the cleanup
      const timerId = setTimeout(async () => {
        try {
          // Get current user profile
          const profile = await getCurrentUserProfile();

          if (!profile) {
            throw new Error('Could not retrieve user profile for cleanup');
          }

          // Delete all logs for the user
          const { error } = await supabase.from('webhook_logs').delete().eq('user_id', profile.id);

          if (error) throw error;

          // Clear logs in the UI
          setLogs([]);
          console.log('Webhook logs cleaned up at midnight IST');

          // Schedule next day's cleanup
          scheduleLogCleanup();
        } catch (err) {
          console.error('Error cleaning up webhook logs:', err);
        }
      }, msUntilMidnight);

      // Return cleanup function
      return () => clearTimeout(timerId);
    };

    const cleanupTimer = scheduleLogCleanup();

    return () => {
      if (subscription) {
        try {
          subscription.unsubscribe();
        } catch (error) {
          console.error('Error unsubscribing:', error);
        }
      }
      cleanupTimer();
    };
  }, []);

  const formatTimestamp = timestamp => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const formatResponseTime = log => {
    if (!log.started_at || !log.completed_at) return 'N/A';
    const startTime = new Date(log.started_at).getTime();
    const endTime = new Date(log.completed_at).getTime();
    const responseTimeMs = endTime - startTime;
    return `${responseTimeMs}ms`;
  };

  const toggleExpandLog = logId => {
    if (expandedLog === logId) {
      setExpandedLog(null);
    } else {
      setExpandedLog(logId);
    }
  };

  return (
    <div className="mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold mb-6">Webhook Logs</h2>

        <div className="bg-zinc-900 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <p className="text-zinc-400">
              Recent webhook calls received from TradingView. These logs show the incoming data from
              your TradingView alerts.
            </p>
            {nextCleanupTime && (
              <div className="text-xs text-zinc-500">
                <span>Next log cleanup: {formatTimestamp(nextCleanupTime)}</span>
                <p className="mt-1">
                  Logs are automatically cleared at midnight IST (Kolkata time)
                </p>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="relative">
                <div className="w-6 h-6 rounded-full absolute border-2 border-solid border-zinc-800"></div>
                <div className="w-6 h-6 rounded-full animate-spin absolute border-2 border-solid border-indigo-500 border-t-transparent"></div>
              </div>
            </div>
          ) : error ? (
            <div className="text-red-500 mb-4 p-3 bg-red-900/20 rounded-lg">{error}</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-zinc-700 rounded-lg">
              <p className="text-zinc-400">
                No webhook logs found. Logs will appear here when you receive alerts from
                TradingView.
              </p>
            </div>
          ) : (
            <div className="overflow-auto rounded-lg border border-zinc-800">
              <table className="min-w-full divide-y divide-zinc-800">
                <thead className="bg-zinc-800">
                  <tr>
                    <th
                      scope="col"
                      className="px-2 py-3 text-center text-xs font-medium text-zinc-400 uppercase tracking-wider"
                    >
                      #
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider"
                    >
                      Time
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider"
                    >
                      JSON
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider"
                    >
                      Response Time
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider"
                    >
                      Output
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-zinc-900 divide-y divide-zinc-800">
                  {logs.map((log, index) => (
                    <React.Fragment key={log.id}>
                      <tr
                        className="hover:bg-zinc-800/50 cursor-pointer transition-colors"
                        onClick={() => toggleExpandLog(log.id)}
                      >
                        <td className="px-2 py-4 whitespace-nowrap text-sm text-center text-zinc-400">
                          {index + 1}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-zinc-300">
                          {formatTimestamp(log.created_at)}
                        </td>
                        <td className="px-4 py-4 text-sm text-zinc-300">
                          <div className="max-w-xs truncate">
                            {log.payload
                              ? JSON.stringify(log.payload).substring(0, 50) + '...'
                              : 'N/A'}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-zinc-300">
                          {formatResponseTime(log)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${log.processed ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}
                          >
                            {log.processed ? 'Processed' : 'Received'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-zinc-300">
                          <div className="max-w-xs truncate">
                            {log.process_result
                              ? JSON.stringify(log.process_result).substring(0, 50) + '...'
                              : 'N/A'}
                          </div>
                        </td>
                      </tr>
                      {expandedLog === log.id && (
                        <tr className="bg-zinc-800/30">
                          <td colSpan="6" className="px-6 py-4">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              <div>
                                <h4 className="text-sm font-medium text-zinc-300 mb-2">
                                  Webhook Payload:
                                </h4>
                                <div className="rounded-md bg-zinc-800 p-3 overflow-auto max-h-80">
                                  <pre className="text-xs text-zinc-300 whitespace-pre-wrap">
                                    {JSON.stringify(log.payload, null, 2)}
                                  </pre>
                                </div>
                              </div>
                              {log.processed && log.process_result && (
                                <div>
                                  <h4 className="text-sm font-medium text-zinc-300 mb-2">
                                    Processing Result:
                                  </h4>
                                  <div className="rounded-md bg-zinc-800 p-3 overflow-auto max-h-80">
                                    <pre className="text-xs text-zinc-300 whitespace-pre-wrap">
                                      {JSON.stringify(log.process_result, null, 2)}
                                    </pre>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="mt-4 text-xs text-zinc-500">
                              <p>Log ID: {log.id}</p>
                              <p>Created: {new Date(log.created_at).toLocaleString()}</p>
                              {log.started_at && (
                                <p>
                                  Processing Started: {new Date(log.started_at).toLocaleString()}
                                </p>
                              )}
                              {log.completed_at && (
                                <p>
                                  Processing Completed:{' '}
                                  {new Date(log.completed_at).toLocaleString()}
                                </p>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
