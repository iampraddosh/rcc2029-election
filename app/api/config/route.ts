import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetching config from DB (Used only for secondary flags, not phase timing)
    const { data, error } = await supabase.from('system_config').select('key, status');

    const configMap = error || !data 
      ? {} 
      : data.reduce((acc: Record<string, any>, item: { key: string, status: any }) => {
          acc[item.key] = item.status;
          return acc;
        }, {});

    const now = new Date();
    
    // Timeline Constants (IST)
    const NOMINATION_END = new Date('2026-07-04T16:00:00+05:30');
    const CONCERNS_END = new Date('2026-07-04T23:59:59+05:30');
    const VOTING_END = new Date('2026-07-06T09:00:00+05:30');

    // Autonomous Phase Logic: 
    // This logic now overrides any manual status in the database to ensure 
    // the timeline is strictly enforced by the server clock.
    configMap.nomination_open = now < NOMINATION_END;
    configMap.concerns_open = now >= NOMINATION_END && now < CONCERNS_END;
    configMap.voting_open = now >= CONCERNS_END && now < VOTING_END;

    return NextResponse.json(configMap);
  } catch (err) {
    return NextResponse.json({ 
      nomination_open: false, 
      concerns_open: false, 
      voting_open: false 
    });
  }
}