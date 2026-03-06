import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// In a real app, this should be a secure environment variable key

async function encrypt(text: string): Promise<string> {
  // Simplistic mock encryption for MVP, replacing with real Web Crypto AES-GCM later
  const buffer = Buffer.from(text, 'utf8');
  return buffer.toString('base64');
}

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { content, session_date } = await request.json();

  if (!content) {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 });
  }

  const encryptedContent = await encrypt(content);

  const { error } = await supabase
    .from('journal_entries')
    .insert({
      user_id: user.id,
      content: encryptedContent,
      session_date: session_date || new Date().toISOString().split('T')[0]
    });

  if (error) {
    console.error("Error saving journal:", error);
    return NextResponse.json({ error: 'Could not save entry' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
