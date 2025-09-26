// app/api/payment/create-order/route.js
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { authMiddleware } from '../../../../middleware/auth';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

export async function POST(req) {
  const auth = await authMiddleware(req);
  if (auth) return auth;
  if (req.user.role !== 'user') return NextResponse.json({ msg: 'Access denied' }, { status: 403 });

  const body = await req.json();
  const { amount } = body;
  const options = {
    amount: amount * 100,
    currency: 'INR',
    receipt: `receipt_${Date.now()}`
  };
  const order = await razorpay.orders.create(options);
  return NextResponse.json({ orderId: order.id, amount: order.amount });
}