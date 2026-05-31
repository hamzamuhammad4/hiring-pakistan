// src/app/api/upload/route.js
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('cv');
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // ✅ ONLY JPG, PNG, PDF ALLOWED for payment screenshots
    const fileType = file.type;
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    
    if (!allowedTypes.includes(fileType)) {
      return NextResponse.json({ error: 'Only JPG, PNG, and PDF files are allowed' }, { status: 400 });
    }

    // ✅ Max 1MB (changed from 5MB)
    if (file.size > 1 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max 1MB' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // ✅ Save to screenshots folder (not cvs)
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'screenshots');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }
    
    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const originalName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const fileName = `${timestamp}_${random}_${originalName}`;
    const filePath = join(uploadDir, fileName);
    
    await writeFile(filePath, buffer);
    
    const fileUrl = `/uploads/screenshots/${fileName}`;
    
    return NextResponse.json({ success: true, url: fileUrl });
    
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}