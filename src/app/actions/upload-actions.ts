
'use server';

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(formData: FormData) {
  const file = formData.get('file') as File;
  if (!file) {
    return { error: 'No file provided.' };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    
    const result = await new Promise<{ secure_url: string; error?: any }>((resolve, reject) => {
        cloudinary.uploader.upload_stream({}, (error, result) => {
            if (error) {
                reject(error);
                return;
            }
            if (result) {
                resolve(result as { secure_url: string });
            } else {
                reject(new Error("Upload failed, result is undefined."));
            }
        }).end(buffer);
    });

    return { url: result.secure_url };
  } catch (error) {
    console.error('Upload error:', error);
    return { error: 'Failed to upload image.' };
  }
}
