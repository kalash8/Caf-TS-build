// app/api/payment/verify/route.js
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import mongoose from 'mongoose';
import Order from '../../../../models/Order';
import { authMiddleware } from '../../../../middleware/auth';

mongoose.connect(process.env.MONGO_URI);

export async function POST(req) {
  const auth = await authMiddleware(req);
  if (auth) return auth;
  if (req.user.role !== 'user') return NextResponse.json({ msg: 'Access denied' }, { status: 403 });

  const body = await req.json();
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, items, pickupTime, total } = body;

  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + '|' + razorpay_payment_id)
    .digest('hex');

  if (generatedSignature !== razorpay_signature) {
    return NextResponse.json({ msg: 'Invalid signature' }, { status: 400 });
  }

  const order = new Order({
    userId: req.user.id,
    items,
    total,
    status: 'Received',
    pickupTime,
    orderDate: Date.now()
  });
  await order.save();

  return NextResponse.json({ msg: 'Payment verified and order created', order });
}