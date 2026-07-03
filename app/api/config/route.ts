import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Initialize Supabase inside the function (or at the top level if exported)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase.from('system_config').select('key, status');

    if (error || !data) {
      return NextResponse.json({ nomination_open: false, voting_open: false });
    }

    // 2. Explicitly type the accumulator to fix the 'any' type error
    const configMap = data.reduce((acc: Record<string, any>, item: { key: string, status: any }) => {
      acc[item.key] = item.status;
      return acc;
    }, {});

    // 3. Automated Time logic
    const now = new Date();
    const NOMINATION_END = new Date('2026-07-03T23:59:59+05:30');
    const VOTING_END = new Date('2026-07-05T18:00:00+05:30');

    configMap.nomination_open = now < NOMINATION_END && configMap.nomination_open;
    configMap.voting_open = now >= NOMINATION_END && now < VOTING_END;

    return NextResponse.json(configMap);
  } catch (err) {
    return NextResponse.json({ nomination_open: false, voting_open: false });
  }
}