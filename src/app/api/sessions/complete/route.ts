import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { duration_minutes } = await request.json();

  // 1. Log the session
  const { error: sessionError } = await supabase
    .from('sessions')
    .insert({
      user_id: user.id,
      duration_minutes,
      completed_at: new Date().toISOString(),
      is_active: false
    });

  if (sessionError) {
    console.error("Error logging session:", sessionError);
    return NextResponse.json({ error: 'Could not log session' }, { status: 500 });
  }

  // 2. Update streak logic
  const { data: profile } = await supabase
    .from('users')
    .select('current_streak, longest_streak, last_session_date, grace_used')
    .eq('id', user.id)
    .single();

  if (profile) {
    const today = new Date();
    // Use UTC date string to avoid timezone issues
    const todayStr = today.toISOString().split('T')[0];
    
    let newStreak = profile.current_streak;
    let newLongest = profile.longest_streak;
    let graceUsed = profile.grace_used;

    if (!profile.last_session_date) {
      // First session ever
      newStreak = 1;
      newLongest = 1;
    } else {
      const lastSession = new Date(profile.last_session_date);
      const diffTime = Math.abs(today.getTime() - lastSession.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (profile.last_session_date === todayStr) {
        // Already logged today, streak unchanged
      } else if (diffDays === 1) {
        // Logged yesterday, increment streak
        newStreak += 1;
        newLongest = Math.max(newStreak, newLongest);
      } else if (diffDays === 2 && !profile.grace_used) {
        // Missed one day, but has grace
        newStreak += 1;
        newLongest = Math.max(newStreak, newLongest);
        graceUsed = true;
      } else {
        // Streak broken
        newStreak = 1;
      }
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({
        current_streak: newStreak,
        longest_streak: newLongest,
        last_session_date: todayStr,
        grace_used: graceUsed
      })
      .eq('id', user.id);

    if (updateError) {
      console.error("Error updating streak:", updateError);
    }
  }

  return NextResponse.json({ success: true });
}
