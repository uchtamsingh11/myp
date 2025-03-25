'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../../src/utils/supabase';
import { getCurrentUserProfile } from '../../../../src/utils/auth/profile';

export default function SubmitTicketPage() {
  const [userProfile, setUserProfile] = useState(null);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [ticketCategory, setTicketCategory] = useState('general');
  const [ticketPriority, setTicketPriority] = useState('medium');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Submit Ticket | AlgoZ';
    
    // Fetch user profile
    const fetchProfile = async () => {
      const profile = await getCurrentUserProfile();
      setUserProfile(profile);
    };
    
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!ticketSubject || !ticketDescription) {
      setError('Please fill in all required fields');
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      // Here you would insert the ticket into your Supabase database
      // This is just a placeholder for the actual implementation
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network request
      
      // Reset form
      setTicketSubject('');
      setTicketDescription('');
      setTicketCategory('general');
      setTicketPriority('medium');
      setSubmitSuccess(true);
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    } catch (error) {
      setError('Failed to submit ticket. Please try again.');
      console.error('Error submitting ticket:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Submit Support Ticket</h1>
      
      <div className="max-w-3xl bg-zinc-800 rounded-lg p-6 shadow-lg">
        {submitSuccess ? (
          <div className="bg-green-500/20 text-green-400 p-4 rounded-md mb-6">
            Your ticket has been submitted successfully. Our support team will get back to you as soon as possible.
          </div>
        ) : null}
        
        {error ? (
          <div className="bg-red-500/20 text-red-400 p-4 rounded-md mb-6">
            {error}
          </div>
        ) : null}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="ticketSubject" className="block text-sm font-medium text-zinc-300 mb-1">
              Subject <span className="text-red-400">*</span>
            </label>
            <input 
              type="text" 
              id="ticketSubject" 
              className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded-md text-white"
              placeholder="Brief description of your issue"
              value={ticketSubject}
              onChange={(e) => setTicketSubject(e.target.value)}
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="ticketCategory" className="block text-sm font-medium text-zinc-300 mb-1">
                Category
              </label>
              <select 
                id="ticketCategory"
                className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded-md text-white"
                value={ticketCategory}
                onChange={(e) => setTicketCategory(e.target.value)}
              >
                <option value="general">General</option>
                <option value="technical">Technical Issue</option>
                <option value="billing">Billing</option>
                <option value="feature">Feature Request</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="ticketPriority" className="block text-sm font-medium text-zinc-300 mb-1">
                Priority
              </label>
              <select 
                id="ticketPriority"
                className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded-md text-white"
                value={ticketPriority}
                onChange={(e) => setTicketPriority(e.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="ticketDescription" className="block text-sm font-medium text-zinc-300 mb-1">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea 
              id="ticketDescription" 
              rows="6"
              className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded-md text-white resize-none"
              placeholder="Please provide as much detail as possible about your issue"
              value={ticketDescription}
              onChange={(e) => setTicketDescription(e.target.value)}
              required
            ></textarea>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Attachments
            </label>
            <div className="border border-dashed border-zinc-700 rounded-md p-4 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-zinc-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-zinc-400 text-sm mb-2">Drag & drop files here, or click to browse</p>
              <p className="text-zinc-500 text-xs">Max file size: 5MB | Supported formats: PNG, JPG, PDF</p>
              <input type="file" className="hidden" />
              <button type="button" className="mt-2 text-blue-400 hover:text-blue-300 text-sm">
                Browse Files
              </button>
            </div>
          </div>
          
          <button 
            type="submit"
            className={`bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded transition-colors ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Ticket'}
          </button>
        </form>
      </div>
    </div>
  );
}
