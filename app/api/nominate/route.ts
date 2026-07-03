import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { fullName, rollNo, emailId, mobileNo, availReservation, availWomen } = await request.json();

    // Server-side validation
    if (!fullName || !rollNo || !emailId || !mobileNo) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // Record nomination with reservation data secured
    const { error } = await supabase
      .from('candidates')
      .insert([{
        full_name: fullName,
        roll_no: rollNo,
        email_id: emailId,
        mobile_no: mobileNo,
        is_reserved_category: availReservation === 'Yes',
        is_women_quota: availWomen === 'Yes'
      }]);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}