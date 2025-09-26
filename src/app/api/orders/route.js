// app/api/orders/route.js
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Order from '../../../models/Order';
import MenuItem from '../../../models/MenuItem';
import { authMiddleware } from '../../../middleware/auth';

mongoose.connect(process.env.MONGO_URI);

export async function POST(req) {
  const auth = await authMiddleware(req);
  if (auth) return auth;
  if (req.user.role !== 'user') return NextResponse.json({ msg: 'Access denied' }, { status: 403 });

  const body = await req.json();
  let total = 0;
  for (let item of body.items) {
    const menuItem = await MenuItem.findById(item.menuItemId);
    total += menuItem.price * item.quantity;
  }

  const order = new Order({ ...body, userId: req.user.id, total });
  await order.save();
  return NextResponse.json(order);
}

export async function GET(req) {
  const auth = await authMiddleware(req);
  if (auth) return auth;

  if (req.user.role === 'user') {
    const orders = await Order.find({ userId: req.user.id }).populate('items.menuItemId');
    return NextResponse.json(orders);
  } else if (req.user.role === 'vendor') {
    const orders = await Order.find({}).populate('userId', 'name').populate('items.menuItemId');
    return NextResponse.json(orders);
  }

  return NextResponse.json({ msg: 'Access denied' }, { status: 403 });
}

export async function PUT(req) {
  const auth = await authMiddleware(req);
  if (auth) return auth;
  if (req.user.role !== 'vendor') return NextResponse.json({ msg: 'Access denied' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const body = await req.json();
  const order = await Order.findByIdAndUpdate(id, { status: body.status }, { new: true });
  return NextResponse.json(order);
}