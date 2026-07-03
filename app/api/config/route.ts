import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase.from('system_config').select('key, status');

    if (error || !data) {
      return NextResponse.json({ 
        nomination_open: false, 
        concerns_open: false, 
        voting_open: false 
      });
    }

    const configMap = data.reduce((acc: Record<string, any>, item: { key: string, status: any }) => {
      acc[item.key] = item.status;
      return acc;
    }, {});

    const now = new Date();
    
    // New Timeline Constants
    const NOMINATION_END = new Date('2026-07-04T16:00:00+05:30');
    const CONCERNS_END = new Date('2026-07-04T23:59:59+05:30');
    const VOTING_END = new Date('2026-07-06T09:00:00+05:30');

    // Phase Logic
    configMap.nomination_open = now < NOMINATION_END && configMap.nomination_open;
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