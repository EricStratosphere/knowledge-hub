import { addContent } from '@/controllers/GoogleCloudPlatformActions';
import { BUCKET_PDF_NAME, BUCKET_PHOTO_NAME } from '@/config/config';
import { writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return Response.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Get buffer from file
    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);

    // Create temporary file path
    const tempDir = tmpdir();
    const tempFileName = `${randomUUID()}-${file.name}`;
    const tempFilePath = join(tempDir, tempFileName);

    // Write to temporary location
    writeFileSync(tempFilePath, uint8Array);

    // Get output name for GCP (without temp directory prefix)
    const outputName = `uploads/${Date.now()}-${file.name}`;

    // Call addContent with the temp file path
    const result = await addContent(BUCKET_PHOTO_NAME, tempFilePath, outputName);

    return Response.json({
      success: result.success,
      message: result.success 
        ? 'File uploaded successfully' 
        : 'Failed to upload file',
      data: result.data || null,
      error: result.error || null,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return Response.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
