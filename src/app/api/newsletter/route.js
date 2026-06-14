import { NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Admin SDK (bypasses client-side rules)
if (!getApps().length) {
  initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

const db = getFirestore();

export async function POST(request) {
  try {
    const { email } = await request.json();
    
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }
    
    // Check if already subscribed
    const existing = await db.collection('newsletter').where('email', '==', email).get();
    
    if (!existing.empty) {
      return NextResponse.json({ message: 'Already subscribed!' }, { status: 200 });
    }
    
    // Add to Firestore (Admin SDK bypasses all rules)
    await db.collection('newsletter').add({
      email: email,
      subscribedAt: new Date(),
      status: 'active',
      source: 'footer'
    });
    
    console.log('New subscriber:', email);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Subscribed successfully!' 
    });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}