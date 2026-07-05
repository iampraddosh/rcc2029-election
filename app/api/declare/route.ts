import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { performSubstitution, Candidate } from '@/lib/allocation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function runDeclarationLogic(authHeader: string | null) {
  // 1. Security Check
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return { error: "Unauthorized", status: 401 };
  }

  // 2. Timeline Check
  const VOTING_END = new Date('2026-07-06T09:00:00+05:30');
  if (new Date() < VOTING_END) {
    return { error: "Voting still open", status: 403 };
  }

  // Check if results already exist to prevent duplicate declaration
  const { data: existing } = await supabase.from('election_results').select('id').limit(1);
  if (existing && existing.length > 0) {
    return { error: "Results already declared", status: 409 };
  }

  // 3. Aggregate Data
  const { data: rawCandidates } = await supabase.from('candidates').select('*');
  const { data: rawBallots } = await supabase.from('ballots').select('votes');

  const voteMap: Record<string, number> = {};
  rawBallots?.forEach(b => {
    try {
      const votes = JSON.parse(b.votes);
      votes.forEach((name: string) => voteMap[name] = (voteMap[name] || 0) + 1);
    } catch (e) {}
  });

  const allCandidates: Candidate[] = (rawCandidates || []).map((c: any) => ({
    id: c.id,
    full_name: c.full_name,
    votes: voteMap[c.full_name] || 0,
    is_reserved_category: c.is_reserved_category,
    is_women_quota: c.is_women_quota
  }));

  const sorted = allCandidates.sort((a, b) => b.votes - a.votes);
  const elected = sorted.slice(0, 13);
  const unelected = sorted.slice(13);

  const { electedList, isTie } = performSubstitution(elected, unelected);

  // 4. Generate Statement
  const sortedNames = electedList.map(c => c.full_name).sort();
  const statement = `DECLARATION OF RESULTS: RECRUITMENT COORDINATION COMMITTEE (RCC) 2029 (2026-27)

The following candidates are hereby declared elected to the Recruitment Coordination Committee (RCC) (2026-27) for the Batch of 2029, listed in alphabetical order:

${sortedNames.join('\n')}

The Election Commission extends its sincere congratulations to the elected representatives and expresses gratitude to the entire batch for the high level of engagement and participation throughout this electoral process.

The Commission maintains full confidence that the newly elected RCC will execute its mandate with integrity and diligence, working constructively to further the best interests of the batch in the upcoming academic year. We wish the Committee every success in the discharge of its responsibilities.

${isTie ? '\n[NOTE: A tie-break protocol was initiated at the margin of the final elected seat in accordance with the 2026 Election Rules.]\n\n' : ''}
Issued by,
The Election Commission
Diya, Lakshay, and Praddosh
July 6, 2026`;

  // 5. Save
  const { error } = await supabase.from('election_results').insert({
    elected_list: electedList,
    official_statement: statement,
    is_tie_detected: isTie,
    declared_at: new Date().toISOString()
  });

  if (error) return { error: "Database save failed: " + error.message, status: 500 };

  return { success: true, isTie, count: electedList.length, status: 200 };
}

// Support both GET (for Cron) and POST (for manual testing)
export async function GET(request: Request) {
  const result = await runDeclarationLogic(request.headers.get('authorization'));
  return NextResponse.json(result, { status: result.status });
}

export async function POST(request: Request) {
  const result = await runDeclarationLogic(request.headers.get('authorization'));
  return NextResponse.json(result, { status: result.status });
}