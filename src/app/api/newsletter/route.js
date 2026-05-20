// src/app/api/newsletter/route.js
import { NextResponse } from 'next/server';

// In-memory storage (for demo - production mein database use karein)
let subscribers = [];

export async function POST(request) {
  try {
    const { email } = await request.json();
    
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }
    
    // Check if already subscribed
    if (subscribers.includes(email)) {
      return NextResponse.json({ message: 'Already subscribed!' }, { status: 200 });
    }
    
    // Add to subscribers list
    subscribers.push(email);
    
    console.log('📧 New subscriber:', email);
    console.log('Total subscribers:', subscribers.length);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Subscribed successfully! Check your email for updates.' 
    });
    
  } catch (error) {
    console.error('Newsletter error:', error);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}

// Optional: GET endpoint to check subscribers (admin only)
export async function GET(request) {
  // In production, add authentication here
  return NextResponse.json({ subscribers, count: subscribers.length });
}