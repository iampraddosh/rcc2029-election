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

    // 1. Autonomous Phase Logic
    configMap.nomination_open = now < NOMINATION_END;
    configMap.concerns_open = now >= NOMINATION_END && now < CONCERNS_END;
    configMap.voting_open = now >= CONCERNS_END && now < VOTING_END;
    
    // 2. Add Results Window Logic
    // Results are pending as soon as voting ends
    configMap.results_pending = now >= VOTING_END;
    
    // 3. Helper Phase String for easy frontend UI conditional rendering
    if (configMap.nomination_open) configMap.phase = 'nominations';
    else if (configMap.concerns_open) configMap.phase = 'concerns';
    else if (configMap.voting_open) configMap.phase = 'voting';
    else if (configMap.results_pending) configMap.phase = 'results_pending';
    else configMap.phase = 'concluded';

    return NextResponse.json(configMap);
  } catch (err) {
    return NextResponse.json({ 
      nomination_open: false, 
      concerns_open: false, 
      voting_open: false,
      results_pending: false,
      phase: 'error'
    });
  }
}