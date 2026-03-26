'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageSquare, Send, Clock, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import { ticketsAPI } from '../../lib/api';
import { getDictionary } from '../../i18n';
import { formatDate, cn } from '../../lib/utils';
import { toast } from 'sonner';
import Navbar from '../../components/Navbar';

export default function SupportPage({ params: { locale = 'en' } }) {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  
  // New ticket form
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  
  const router = useRouter();
  const dict = getDictionary(locale);
  const t = dict?.common || {};
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/${locale}/login`);
      return;
    }
    fetchTickets();
  }, [isAuthenticated, router, locale]);

  const fetchTickets = async () => {
    try {
      const response = await ticketsAPI.getMyTickets();
      setTickets(response.data.tickets || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      await ticketsAPI.create({ subject, description, priority });
      toast.success('Ticket created successfully');
      setShowNewTicket(false);
      setSubject('');
      setDescription('');
      setPriority('medium');
      fetchTickets();
    } catch (error) {
      toast.error('Failed to create ticket');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!selectedTicket || !newMessage.trim()) return;
    
    try {
      await ticketsAPI.addMessage(selectedTicket.id, { message: newMessage });
      setNewMessage('');
      // Refresh selected ticket
      const updated = await ticketsAPI.getOne(selectedTicket.id);
      setSelectedTicket({ ...updated.data.ticket, messages: updated.data.messages });
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleCloseTicket = async (ticketId) => {
    try {
      await ticketsAPI.close(ticketId);
      toast.success('Ticket closed');
      fetchTickets();
    } catch (error) {
      toast.error('Failed to close ticket');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <MessageSquare className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-100 text-yellow-700';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700';
      case 'resolved':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar locale={locale} dict={dict} />
        <div className="pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="skeleton h-8 w-48 mb-8" />
            <div className="skeleton h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar locale={locale} dict={dict} />
      
      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Support Center</h1>
            <button 
              onClick={() => setShowNewTicket(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              New Ticket
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Tickets List */}
            <div className="lg:col-span-1">
              <div className="card">
                <h2 className="text-lg font-semibold mb-4">Your Tickets</h2>
                {tickets.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No tickets yet</p>
                ) : (
                  <div className="space-y-3">
                    {tickets.map((ticket) => (
                      <div 
                        key={ticket.id}
                        onClick={() => setSelectedTicket(ticket)}
                        className={cn(
                          "p-4 rounded-lg cursor-pointer transition-colors",
                          selectedTicket?.id === ticket.id 
                            ? "bg-primary-50 border-primary-200" 
                            : "bg-gray-50 hover:bg-gray-100"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          {getStatusIcon(ticket.status)}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm truncate">{ticket.subject}</h3>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDate(ticket.created_at, locale)}
                            </p>
                            <span className={cn(
                              "inline-block mt-2 text-xs px-2 py-1 rounded-full",
                              getStatusColor(ticket.status)
                            )}>
                              {ticket.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Ticket Details */}
            <div className="lg:col-span-2">
              {selectedTicket ? (
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold">{selectedTicket.subject}</h2>
                      <div className="flex items-center gap-3 mt-2">
                        <span className={cn(
                          "text-sm px-3 py-1 rounded-full",
                          getStatusColor(selectedTicket.status)
                        )}>
                          {selectedTicket.status.replace('_', ' ')}
                        </span>
                        <span className="text-sm text-gray-500">
                          Priority: {selectedTicket.priority}
                        </span>
                      </div>
                    </div>
                    {selectedTicket.status !== 'resolved' && (
                      <button 
                        onClick={() => handleCloseTicket(selectedTicket.id)}
                        className="btn-secondary"
                      >
                        Close Ticket
                      </button>
                    )}
                  </div>

                  {/* Messages */}
                  <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                    {/* Initial message */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm">{selectedTicket.description}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {formatDate(selectedTicket.created_at, locale)}
                      </p>
                    </div>

                    {/* Reply messages */}
                    {selectedTicket.messages?.map((msg, index) => (
                      <div 
                        key={index}
                        className={cn(
                          "p-4 rounded-lg",
                          msg.is_admin_reply 
                            ? "bg-blue-50 border-l-4 border-blue-500" 
                            : "bg-gray-50"
                        )}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-gray-400">
                            {msg.user_name} • {formatDate(msg.created_at, locale)}
                          </p>
                          {msg.is_admin_reply && (
                            <span className="text-xs text-blue-600">Support Team</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Reply Form */}
                  {selectedTicket.status !== 'resolved' && (
                    <form onSubmit={handleSendMessage} className="flex gap-3">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="input flex-1"
                      />
                      <button type="submit" className="btn-primary px-4">
                        <Send className="w-5 h-5" />
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                <div className="card p-12 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Select a ticket to view details</p>
                </div>
              )}
            </div>
          </div>

          {/* New Ticket Modal */}
          {showNewTicket && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg">
                <h2 className="text-xl font-semibold mb-4">Create New Ticket</h2>
                <form onSubmit={handleCreateTicket}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Subject</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="input w-full"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="input w-full h-32"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="input w-full"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowNewTicket(false)}
                      className="btn-secondary flex-1"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary flex-1">
                      Create Ticket
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}