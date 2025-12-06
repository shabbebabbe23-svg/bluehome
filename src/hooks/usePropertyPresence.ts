import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function usePropertyPresence(propertyId: string | undefined) {
  const [viewerCount, setViewerCount] = useState(0);
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    if (!propertyId) return;

    const channelName = `property-viewers:${propertyId}`;
    
    // Create a unique session ID for this viewer
    const sessionId = `viewer-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: sessionId,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const count = Object.keys(state).length;
        setViewerCount(count);
        console.log('Presence sync - Viewers:', count);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('Viewer joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('Viewer left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track this user's presence
          await channel.track({
            online_at: new Date().toISOString(),
            property_id: propertyId,
          });
          setIsTracking(true);
          console.log('Tracking presence for property:', propertyId);
        }
      });

    // Cleanup on unmount
    return () => {
      console.log('Leaving presence channel for property:', propertyId);
      channel.untrack();
      supabase.removeChannel(channel);
      setIsTracking(false);
    };
  }, [propertyId]);

  return { viewerCount, isTracking };
}
