// app/api/vendors/route.js
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import User from '../../../models/User';

mongoose.connect(process.env.MONGO_URI);

export async function GET(req) {
  const vendors = await User.find({ role: 'vendor' }).select('_id name');
  return NextResponse.json(vendors);
}