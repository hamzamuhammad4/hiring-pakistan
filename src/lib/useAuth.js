// src/lib/useAuth.js - PERMANENT FIX FOR ALL COMPANIES
"use client";

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser && currentUser.emailVerified) {
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userRole = userDoc.data().role;
          setRole(userRole);
          
          // ✅ PERMANENT FIX: Agar role missing hai to set karo
          if (!userRole) {
            console.log("Setting default role for:", currentUser.email);
            await setDoc(userRef, { role: "pending" }, { merge: true });
            setRole("pending");
          }
        } else {
          // ✅ New user: Create document with role
          console.log("Creating new user document for:", currentUser.email);
          await setDoc(userRef, {
            email: currentUser.email,
            role: "pending",  // Default role
            createdAt: new Date(),
            status: "active"
          });
          setRole("pending");
        }
      } else {
        setRole(null);
      }
      
      setLoading(false);
    });
    
    return unsubscribe;
  }, []);

  return { user, role, loading };
}