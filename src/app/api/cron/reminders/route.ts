import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY!);
    const supabase = createClient();
    
    // In a real application, we would check for a secure cron secret header here
    // const authHeader = request.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) { ... }

    // Fetch users who want reminders
    const { data: users, error } = await supabase
      .from('users')
      .select('email, current_streak')
      .eq('reminder_enabled', true);

    if (error) throw error;

    if (!users || users.length === 0) {
      return NextResponse.json({ message: 'No emails to send' });
    }

    // Prepare emails
    const emails = users.map(user => ({
      from: 'Silence <practice@silence.app>', // Note: Must verify domain with Resend
      to: user.email,
      subject: 'Time for stillness',
      html: `
        <div style="font-family: serif; text-align: center; color: #2C2825; background: #F5F0E8; padding: 40px;">
          <h1 style="font-weight: normal; letter-spacing: 2px;">Silence</h1>
          <p style="margin-top: 20px;">Your ${user.current_streak > 0 ? `Current Streak: ${user.current_streak}. ` : ''}A few minutes of stillness await.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://silence.app'}" style="display: inline-block; margin-top: 30px; padding: 12px 24px; border: 1px solid #8C8078; color: #2C2825; text-decoration: none; text-transform: uppercase; font-size: 12px; letter-spacing: 2px; border-radius: 40px;">Begin Session</a>
        </div>
      `
    }));

    // Send emails in batch
    await resend.batch.send(emails);

    return NextResponse.json({ success: true, count: emails.length });
  } catch (error) {
    console.error('Error sending reminders:', error);
    return NextResponse.json({ error: 'Failed to send reminders' }, { status: 500 });
  }
}
