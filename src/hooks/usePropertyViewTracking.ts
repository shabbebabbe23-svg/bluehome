import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

// Generate a unique session ID for this browser session
const getSessionId = () => {
  let sessionId = sessionStorage.getItem("property_view_session_id");
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    sessionStorage.setItem("property_view_session_id", sessionId);
  }
  return sessionId;
};

// Detect device type
const getDeviceType = (): string => {
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) {
    return 'tablet';
  }
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
};

export const usePropertyViewTracking = (propertyId: string) => {
  const startTimeRef = useRef<number>(Date.now());
  const viewIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!propertyId) return;

    const sessionId = getSessionId();
    startTimeRef.current = Date.now();

    // Get visitor location using IP geolocation
    const getVisitorLocation = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        return {
          city: data.city || null,
          region: data.region || null,
          country: data.country_name || 'Sweden',
        };
      } catch (error) {
        console.error("Error fetching location:", error);
        return {
          city: null,
          region: null,
          country: 'Sweden',
        };
      }
    };

    // Log the initial view
    const logView = async () => {
      try {
        const location = await getVisitorLocation();
        const deviceType = getDeviceType();
        
        const { data, error } = await supabase
          .from("property_views")
          .insert({
            property_id: propertyId,
            session_id: sessionId,
            view_started_at: new Date().toISOString(),
            time_spent_seconds: 0,
            visitor_city: location.city,
            visitor_region: location.region,
            visitor_country: location.country,
            device_type: deviceType,
          })
          .select()
          .single();

        if (error) {
          console.error("Error logging view:", error);
          return;
        }

        viewIdRef.current = data?.id;
      } catch (error) {
        console.error("Error logging view:", error);
      }
    };

    logView();

    // Update time spent when user leaves or closes the page
    const updateTimeSpent = async () => {
      if (!viewIdRef.current) return;

      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);

      try {
        await supabase
          .from("property_views")
          .update({ time_spent_seconds: timeSpent })
          .eq("id", viewIdRef.current);
      } catch (error) {
        console.error("Error updating time spent:", error);
      }
    };

    // Set up interval to update time spent every 3 seconds (for accuracy if user closes tab)
    const intervalId = setInterval(() => {
      updateTimeSpent();
    }, 3000);

    // Update when component unmounts or page unloads
    const handleBeforeUnload = () => {
      updateTimeSpent();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      updateTimeSpent();
    };
  }, [propertyId]);
};
