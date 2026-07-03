import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // 1. Check if the Election Commission has declared the results
    const { data: config } = await supabase
      .from('system_config')
      .select('status')
      .eq('key', 'results_declared')
      .single();

    const resultsDeclared = config?.status || false;

    // 2. Fetch the candidate roster - always sorted alphabetically by name
    const { data: candidates, error: candidateError } = await supabase
      .from('candidates')
      .select('full_name, roll_no, email_id')
      .order('full_name', { ascending: true });

    if (candidateError) return NextResponse.json({ error: candidateError.message }, { status: 500 });

    return NextResponse.json({ 
      resultsDeclared, 
      candidates 
    });

  } catch (err) {
    return NextResponse.json({ error: "Failed to compile election roster parameters." }, { status: 500 });
  }
}