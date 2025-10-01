'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Users, 
  Play, 
  Headphones, 
  Camera,
  MessageCircle,
  Video,
  ExternalLink,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { createSocialManager, type LiveEvent } from '@/lib/social/social-manager';

interface LiveEventsProps {
  userId?: string;
  className?: string;
}

export default function LiveEvents({ userId, className = '' }: LiveEventsProps) {
  const [socialManager] = useState(() => createSocialManager());
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joiningEvent, setJoiningEvent] = useState<string | null>(null);

  useEffect(() => {
    loadEvents();
  }, [socialManager]);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const [upcomingEvents, activeEvents] = await Promise.all([
        socialManager.getUpcomingLiveEvents(),
        socialManager.getActiveLiveEvents()
      ]);
      
      // Combine and sort events
      const allEvents = [...activeEvents, ...upcomingEvents].sort(
        (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
      
      setEvents(allEvents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinEvent = async (eventId: string) => {
    if (!userId) {
      alert('Please log in to join events');
      return;
    }

    try {
      setJoiningEvent(eventId);
      const success = await socialManager.joinLiveEvent(eventId, userId);
      
      if (success) {
        // Reload events to update participant count
        await loadEvents();
        alert('Successfully joined the event!');
      } else {
        alert('Failed to join event. It may be full or not available.');
      }
    } catch (err) {
      console.error('Error joining event:', err);
      alert('Failed to join event');
    } finally {
      setJoiningEvent(null);
    }
  };

  const getEventIcon = (eventType: LiveEvent['eventType']) => {
    switch (eventType) {
      case 'VR_TASTING':
        return <Headphones className="w-5 h-5" />;
      case 'AR_DEMO':
        return <Camera className="w-5 h-5" />;
      case 'LIVE_STREAM':
        return <Video className="w-5 h-5" />;
      case 'Q_AND_A':
        return <MessageCircle className="w-5 h-5" />;
      default:
        return <Play className="w-5 h-5" />;
    }
  };

  const getEventColor = (eventType: LiveEvent['eventType']) => {
    switch (eventType) {
      case 'VR_TASTING':
        return 'bg-purple-100 border-purple-200 text-purple-800';
      case 'AR_DEMO':
        return 'bg-blue-100 border-blue-200 text-blue-800';
      case 'LIVE_STREAM':
        return 'bg-red-100 border-red-200 text-red-800';
      case 'Q_AND_A':
        return 'bg-green-100 border-green-200 text-green-800';
      default:
        return 'bg-gray-100 border-gray-200 text-gray-800';
    }
  };

  const getEventStatus = (event: LiveEvent) => {
    const now = new Date();
    const startTime = new Date(event.startTime);
    const endTime = event.endTime ? new Date(event.endTime) : null;

    if (now < startTime) {
      return { status: 'upcoming', text: 'Upcoming' };
    } else if (now >= startTime && (!endTime || now <= endTime)) {
      return { status: 'live', text: 'Live Now' };
    } else {
      return { status: 'ended', text: 'Ended' };
    }
  };

  const formatEventTime = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatEventDuration = (startTime: Date, endTime: Date | null) => {
    const start = new Date(startTime);
    if (!endTime) return 'Ongoing';
    const end = new Date(endTime);
    const durationMs = end.getTime() - start.getTime();
    const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
    const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (durationHours > 0) {
      return `${durationHours}h ${durationMinutes}m`;
    }
    return `${durationMinutes}m`;
  };

  if (isLoading) {
    return (
      <div className={`w-full ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`w-full ${className}`}>
        <div className="text-center py-8">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">Failed to load events</p>
          <button
            onClick={loadEvents}
            className="mt-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-amber-500" />
          Live Events
        </h2>
        <button
          onClick={loadEvents}
          disabled={isLoading}
          className="p-2 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
        >
          <motion.div
            animate={{ rotate: isLoading ? 360 : 0 }}
            transition={{ duration: 1, repeat: isLoading ? Infinity : 0 }}
          >
            <Calendar className="w-5 h-5" />
          </motion.div>
        </button>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        <AnimatePresence>
          {events.map((event, index) => {
            const eventStatus = getEventStatus(event);
            const isFull = event.currentParticipants >= event.maxParticipants;
            const canJoin = eventStatus.status === 'live' && !isFull && userId;
            
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border-2 ${getEventColor(event.eventType)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white/50 rounded-lg">
                      {getEventIcon(event.eventType)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{event.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          eventStatus.status === 'live' 
                            ? 'bg-red-100 text-red-800' 
                            : eventStatus.status === 'upcoming'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {eventStatus.text}
                        </span>
                      </div>
                      <p className="text-sm opacity-75 mb-2">{event.description}</p>
                      
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatEventTime(event.startTime)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>
                            {event.currentParticipants}/{event.maxParticipants} participants
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>Duration: {formatEventDuration(event.startTime, event.endTime)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {canJoin ? (
                      <button
                        onClick={() => handleJoinEvent(event.id)}
                        disabled={joiningEvent === event.id}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
                      >
                        {joiningEvent === event.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                        <span>Join</span>
                      </button>
                    ) : eventStatus.status === 'live' && isFull ? (
                      <span className="px-3 py-1 bg-red-100 text-red-800 rounded-lg text-sm">
                        Full
                      </span>
                    ) : eventStatus.status === 'upcoming' ? (
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm">
                        Starting Soon
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-lg text-sm">
                        Ended
                      </span>
                    )}

                    {event.meetingUrl && (
                      <a
                        href={event.meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {events.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No live events scheduled
            </h3>
            <p className="text-gray-500">
              Check back later for upcoming VR tastings, AR demos, and live streams!
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
