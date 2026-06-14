import { NextResponse } from 'next/server';

// Temporary in-memory storage
let subscribers = [];

export async function POST(request) {
  try {
    const { email } = await request.json();
    
    console.log("Received email:", email);
    
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }
    
    if (subscribers.includes(email)) {
      return NextResponse.json({ message: 'Already subscribed!' }, { status: 200 });
    }
    
    subscribers.push(email);
    console.log("Subscriber added:", email);
    console.log("Total subscribers:", subscribers.length);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Subscribed successfully!' 
    });
    
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}