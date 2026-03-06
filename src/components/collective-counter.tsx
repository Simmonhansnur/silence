"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export function CollectiveCounter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    const roomOne = supabase.channel('silence_active');

    roomOne
      .on('presence', { event: 'sync' }, () => {
        const newState = roomOne.presenceState();
        setCount(Object.values(newState).length);
      })
      .on('presence', { event: 'join' }, () => {
        // Handled by sync
      })
      .on('presence', { event: 'leave' }, () => {
        // Handled by sync
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track current user presence
          const { data } = await supabase.auth.getUser();
          const userId = data?.user?.id || crypto.randomUUID();
          await roomOne.track({
            user_id: userId,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(roomOne);
    };
  }, []);

  return (
    <div className="absolute bottom-8 right-8 flex items-center gap-2 text-xs text-secondary opacity-50 hover:opacity-100 transition-opacity">
      <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
      {count} practicing stillness
    </div>
  );
}
