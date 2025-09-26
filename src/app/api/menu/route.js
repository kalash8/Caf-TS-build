import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import MenuItem from '../../../models/MenuItem';
import { authMiddleware } from '../../../middleware/auth';

mongoose.connect(process.env.MONGO_URI);

export async function GET(req) {
  const auth = await authMiddleware(req);
  if (auth) return auth;

  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');

  if (date) {
    const items = await MenuItem.find({ date: new Date(date) }).populate('vendorId', 'name');
    return NextResponse.json(items);
  } else if (req.user.role === 'vendor') {
    const items = await MenuItem.find({ vendorId: req.user.id });
    return NextResponse.json(items);
  }

  return NextResponse.json({ msg: 'Invalid request' }, { status: 400 });
}

export async function POST(req) {
  const auth = await authMiddleware(req);
  if (auth) return auth;
  if (req.user.role !== 'vendor') return NextResponse.json({ msg: 'Access denied' }, { status: 403 });

  const body = await req.json();
  const item = new MenuItem({ ...body, vendorId: req.user.id });
  await item.save();
  return NextResponse.json(item);
}

export async function PUT(req) {
  const auth = await authMiddleware(req);
  if (auth) return auth;
  if (req.user.role !== 'vendor') return NextResponse.json({ msg: 'Access denied' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const body = await req.json();
  const item = await MenuItem.findByIdAndUpdate(id, body, { new: true });
  return NextResponse.json(item);
}