// src/app/api/newsletter/route.js
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';

export async function POST(request) {
  try {
    const { email } = await request.json();
    
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }
    
    // Check if already subscribed in Firestore
    const q = query(collection(db, "newsletter"), where("email", "==", email));
    const existing = await getDocs(q);
    
    if (!existing.empty) {
      return NextResponse.json({ 
        message: 'Already subscribed!' 
      }, { status: 200 });
    }
    
    // Add to Firestore
    await addDoc(collection(db, "newsletter"), {
      email: email,
      subscribedAt: serverTimestamp(),
      status: 'active',
      source: 'footer'
    });
    
    console.log('📧 New subscriber:', email);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Subscribed successfully! Check your email for updates.' 
    });
    
  } catch (error) {
    console.error('Newsletter error:', error);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}

// GET endpoint for admin to fetch subscribers
export async function GET(request) {
  try {
    // Check for admin authentication
    const authHeader = request.headers.get('authorization');
    
    // Simple check - in production, use proper authentication
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
      // For now, allow if it's an internal request
      const url = new URL(request.url);
      const isAdminCall = url.searchParams.get('admin') === 'true';
      
      if (!isAdminCall) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }
    
    const snapshot = await getDocs(collection(db, "newsletter"));
    const subscribers = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      subscribedAt: doc.data().subscribedAt?.toDate?.() || new Date()
    }));
    
    return NextResponse.json({ 
      subscribers, 
      count: subscribers.length 
    });
    
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 });
  }
}