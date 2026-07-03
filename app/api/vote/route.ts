import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // 1. Capture the new token field
    const { email, token, selectedCandidates } = await request.json();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 2. Verify voter authorization AND match the unique token
    const { data: voter, error: voterError } = await supabase
      .from('voters')
      .select('has_voted, access_token')
      .eq('email', email)
      .eq('access_token', token) // Must match the token in the DB
      .single();

    if (voterError || !voter) {
      // If no row is found, it means either the email is wrong OR the token is wrong
      return NextResponse.json({ error: "Invalid credentials. Access Denied." }, { status: 403 });
    }

    // 3. Prevent re-voting
    if (voter.has_voted) {
      return NextResponse.json({ error: "Fraud prevention: Ballot already cast for this email." }, { status: 403 });
    }

    // 4. Mark as voted
    const { error: updateError } = await supabase
      .from('voters')
      .update({ has_voted: true, voted_at: new Date().toISOString() })
      .eq('email', email);

    if (updateError) throw updateError;

    // 5. Deposit anonymous ballot
    const { error: ballotError } = await supabase
      .from('ballots')
      .insert({ votes: selectedCandidates });

    if (ballotError) throw ballotError;

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("Critical API Error:", err);
    return NextResponse.json({ error: "Server handshake failed. Please contact the EC." }, { status: 500 });
  }
}