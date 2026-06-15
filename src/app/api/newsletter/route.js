import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';

// In-memory storage as fallback
let memorySubscribers = [];

export async function POST(request) {
  try {
    const { email } = await request.json();
    
    console.log("Newsletter request for:", email);
    
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }
    
    // Try Firestore first
    try {
      const q = query(collection(db, "newsletter"), where("email", "==", email));
      const existing = await getDocs(q);
      
      if (!existing.empty) {
        return NextResponse.json({ message: 'Already subscribed!' }, { status: 200 });
      }
      
      await addDoc(collection(db, "newsletter"), {
        email: email,
        subscribedAt: serverTimestamp(),
        status: 'active',
        source: 'footer'
      });
      
      console.log("Saved to Firestore:", email);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Subscribed successfully!' 
      });
      
    } catch (firestoreError) {
      // If Firestore fails, use in-memory storage
      console.log("Firestore error, using memory storage:", firestoreError.message);
      
      if (memorySubscribers.includes(email)) {
        return NextResponse.json({ message: 'Already subscribed!' }, { status: 200 });
      }
      
      memorySubscribers.push(email);
      console.log("Saved to memory. Total:", memorySubscribers.length);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Subscribed successfully!' 
      });
    }
    
  } catch (error) {
    console.error("Newsletter error:", error);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Try Firestore first
    try {
      const snapshot = await getDocs(collection(db, "newsletter"));
      const subscribers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        subscribedAt: doc.data().subscribedAt?.toDate?.() || new Date()
      }));
      return NextResponse.json({ subscribers, count: subscribers.length });
    } catch (firestoreError) {
      // Fallback to memory
      const subscribers = memorySubscribers.map((email, index) => ({
        id: `mem_${index}`,
        email: email,
        subscribedAt: new Date(),
        status: 'active',
        source: 'footer'
      }));
      return NextResponse.json({ subscribers, count: subscribers.length });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }
    
    // Try Firestore delete
    try {
      const { doc, deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, "newsletter", id));
      console.log("Deleted from Firestore:", id);
    } catch (firestoreError) {
      // If Firestore fails, remove from memory
      if (id.startsWith('mem_')) {
        const index = parseInt(id.split('_')[1]);
        memorySubscribers.splice(index, 1);
        console.log("Deleted from memory");
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}