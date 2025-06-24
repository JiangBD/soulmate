// src/app/api/logout/route.js
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { token } = await req.json();
    // Ở đây bạn có thể thực hiện bất kỳ logic nào để invalid token trên server
    // (ví dụ lưu vào một blacklist hoặc thay đổi secret, tùy cách thiết kế)
    console.log('Logout requested for token:', token);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
