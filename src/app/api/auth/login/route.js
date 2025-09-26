// app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import User from '../../../../models/User';
import jwt from 'jsonwebtoken';

mongoose.connect(process.env.MONGO_URI);

export async function POST(req) {
  const body = await req.json();
  const { email, password } = body;

  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    return NextResponse.json({ msg: 'Invalid credentials' }, { status: 400 });
  }

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  return NextResponse.json({ token, role: user.role });
}