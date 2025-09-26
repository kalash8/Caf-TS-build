// app/api/auth/register/route.js
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import User from '../../../../models/User';
import jwt from 'jsonwebtoken';

mongoose.connect(process.env.MONGO_URI);

export async function POST(req) {
  const body = await req.json();
  const { name, email, password, role } = body;

  let user = await User.findOne({ email });
  if (user) return NextResponse.json({ msg: 'User exists' }, { status: 400 });

  user = new User({ name, email, password, role });
  await user.save();

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  return NextResponse.json({ token, role: user.role });
}