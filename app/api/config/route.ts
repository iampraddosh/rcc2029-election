import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from('system_config')
      .select('key, status');

    const configMap: Record<string, any> = error || !data
      ? {}
      : data.reduce((acc: Record<string, any>, item: { key: string, status: any }) => {
          acc[item.key] = item.status;
          return acc;
        }, {});

    const now = new Date();

    // RCC 2029 By-Election Timeline (IST)

    // Nominations: 27 October, 12 AM to 28 October, 12 AM
    const NOMINATION_START = new Date('2026-10-27T00:00:00+05:30');
    const NOMINATION_END = new Date('2026-10-28T21:00:00+05:30');

    // Concerns: 28 October, 12 AM to 12 PM (noon)
    const CONCERNS_START = NOMINATION_END;
    const CONCERNS_END = new Date('2026-10-29T09:00:00+05:30');

    // Withdrawal and Concerns Windows run concurrently
    const WITHDRAWAL_START = CONCERNS_START;
    const WITHDRAWAL_END = CONCERNS_END;

    // Voting: 28 October, 12 PM to 29 October, 9 PM
    const VOTING_START = CONCERNS_END;
    const VOTING_END = new Date('2026-10-30T22:00:00+05:30');

    // 1. Autonomous Phase Logic

    configMap.nomination_open =
      now >= NOMINATION_START && now < NOMINATION_END;

    configMap.concerns_open =
      now >= CONCERNS_START && now < CONCERNS_END;

    configMap.withdrawal_open =
      now >= WITHDRAWAL_START && now < WITHDRAWAL_END;

    configMap.voting_open =
      now >= VOTING_START && now < VOTING_END;

    // 2. Results Window Logic

    configMap.results_pending = now >= VOTING_END;

    // 3. Frontend Phase Helper

    if (configMap.nomination_open) {
      configMap.phase = 'nominations';
    } else if (configMap.concerns_open) {
      configMap.phase = 'concerns';
    } else if (configMap.voting_open) {
      configMap.phase = 'voting';
    } else if (configMap.results_pending) {
      configMap.phase = 'results_pending';
    } else {
      configMap.phase = 'upcoming';
    }

    // 4. Deadline for Public Tracker Countdown

    configMap.phase_ends_at =
      configMap.nomination_open
        ? NOMINATION_END.toISOString()
        : configMap.concerns_open
        ? CONCERNS_END.toISOString()
        : configMap.voting_open
        ? VOTING_END.toISOString()
        : configMap.phase === 'upcoming'
        ? NOMINATION_START.toISOString()
        : null;

    return NextResponse.json(configMap);

  } catch (err) {
    return NextResponse.json({
      nomination_open: false,
      concerns_open: false,
      withdrawal_open: false,
      voting_open: false,
      results_pending: false,
      phase: 'error',
      phase_ends_at: null
    }, { status: 500 });
  }
}