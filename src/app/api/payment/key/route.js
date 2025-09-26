// app/api/payment/key/route.js
import { NextResponse } from 'next/server';

export async function GET(req) {
  return NextResponse.json({ key: process.env.RAZORPAY_KEY_ID });
}