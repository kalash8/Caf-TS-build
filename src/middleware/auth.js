import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

export async function authMiddleware(req) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ msg: 'No token' }, { status: 401 });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return null;
  } catch (err) {
    return NextResponse.json({ msg: 'Invalid token' }, { status: 401 });
  }
}