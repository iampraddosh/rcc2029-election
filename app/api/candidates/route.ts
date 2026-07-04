import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // 1. Fetch Candidates sorted alphabetically
    const { data: candidates, error: candidateError } = await supabase
      .from('candidates')
      .select('full_name, roll_no, email_id')
      .order('full_name', { ascending: true });

    if (candidateError) return NextResponse.json({ error: candidateError.message }, { status: 500 });

    // 2. Return roster. The frontend can now decide if it shows these 
    // based on the 'voting_open' flag received from /api/config.
    return NextResponse.json({ 
      candidates 
    });

  } catch (err) {
    return NextResponse.json({ error: "Failed to compile election roster parameters." }, { status: 500 });
  }
}