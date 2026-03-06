"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export function ReminderToggle({ initialEnabled }: { initialEnabled: boolean }) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const toggle = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { error } = await supabase
        .from('users')
        .update({ reminder_enabled: !enabled })
        .eq('id', user.id);
        
      if (!error) {
        setEnabled(!enabled);
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-4 text-sm mt-4">
      <span className="text-secondary tracking-widest uppercase text-xs">Daily Reminder</span>
      <button 
        onClick={toggle}
        disabled={loading}
        className={`w-10 h-5 rounded-full relative transition-colors ${enabled ? 'bg-foreground' : 'bg-secondary/30'}`}
      >
        <div className={`w-3 h-3 rounded-full bg-background absolute top-1 transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}
