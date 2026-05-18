// src/app/api/upload/route.js
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('cv');
    
    if (!file) {
      return Response.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Check file type (only PDF, DOC, DOCX)
    const fileType = file.type;
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(fileType)) {
      return Response.json({ error: 'Only PDF, DOC, DOCX files are allowed' }, { status: 400 });
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return Response.json({ error: 'File too large. Max 5MB' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'cvs');
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
    
    const fileUrl = `/uploads/cvs/${fileName}`;
    
    return Response.json({ success: true, url: fileUrl });
    
  } catch (error) {
    console.error('Upload error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}