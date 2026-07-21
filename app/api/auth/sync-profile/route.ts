import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = body?.id;
    const email = body?.email;
    const is_premium = body?.is_premium;

    if (!id || !email) {
      return NextResponse.json({ error: 'Missing user id or email' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id,
        email: String(email).trim().toLowerCase(),
        is_premium: typeof is_premium === 'boolean' ? is_premium : false,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error("Failed to sync profile via admin service role:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, profile: data });
  } catch (err: any) {
    console.error("sync-profile POST error:", err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Sync all existing users from auth.users into public.profiles using admin privileges
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      return NextResponse.json({ error: listError.message }, { status: 500 });
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ success: true, syncedCount: 0, message: 'No users found in auth.users' });
    }

    const profileRows = users.map(u => ({
      id: u.id,
      email: u.email || '',
      updated_at: new Date().toISOString()
    }));

    const { data, error: upsertError } = await supabaseAdmin
      .from('profiles')
      .upsert(profileRows, { onConflict: 'id' })
      .select();

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      syncedCount: data?.length || profileRows.length,
      profiles: data
    });
  } catch (err: any) {
    console.error("sync-profile GET error:", err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
