import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Cloudinary configuration
let cloudName: string | undefined;
let apiKey: string | undefined;
let apiSecret: string | undefined;

// Cloudinary can be configured either through separate environment variables or via CLOUDINARY_URL
if (process.env.CLOUDINARY_URL) {
  console.log('Using CLOUDINARY_URL for configuration');
  // Extract configuration from CLOUDINARY_URL
  try {
    // URL format: cloudinary://api_key:api_secret@cloud_name
    const cloudinaryUrl = process.env.CLOUDINARY_URL;
    const match = cloudinaryUrl.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
    
    if (match) {
      apiKey = match[1];
      apiSecret = match[2];
      cloudName = match[3];
      console.log(`Extracted Cloudinary config from URL - cloud_name: ${cloudName}`);
    } else {
      console.error('Invalid CLOUDINARY_URL format');
    }
  } catch (error) {
    console.error('Error parsing CLOUDINARY_URL:', error);
  }
} else if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  console.log('Using individual Cloudinary environment variables');
  cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  apiKey = process.env.CLOUDINARY_API_KEY;
  apiSecret = process.env.CLOUDINARY_API_SECRET;
} else {
  console.error('Missing required Cloudinary environment variables');
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

// Display confirmation message to help with debugging
console.log(`Cloudinary initialized with:
- cloud_name: ${cloudName}
- api_key exists: ${Boolean(apiKey)}
- api_secret exists: ${Boolean(apiSecret)}
`);

// Default folder for storing product images
const PRODUCT_IMAGES_FOLDER = 'jaberco_ecommerce/products';

// Interface for upload result
export interface CloudinaryUploadResult {
  success: boolean;
  imageUrl?: string;
  publicId?: string;
  format?: string;
  width?: number;
  height?: number;
  error?: string;
}

/**
 * Upload an image to Cloudinary
 * @param filePath Path to the temporary file on the server
 * @param publicId Public ID for the image (optional)
 * @returns Promise containing the upload result
 */
export const uploadImage = async (filePath: string, publicId?: string): Promise<CloudinaryUploadResult> => {
  try {
    console.log(`Attempting to upload image from ${filePath} to Cloudinary...`);
    
    // Verify Cloudinary configuration
    if (!cloudName || !apiKey || !apiSecret) {
      console.error('Cloudinary configuration is incomplete:');
      console.error(`- cloud_name exists: ${Boolean(cloudName)}`);
      console.error(`- api_key exists: ${Boolean(apiKey)}`);
      console.error(`- api_secret exists: ${Boolean(apiSecret)}`);
      return {
        success: false,
        error: 'Cloudinary configuration is incomplete. Check environment variables.'
      };
    }
    
    // Check if file path exists
    if (!filePath) {
      console.error('No file path provided for upload');
      return {
        success: false,
        error: 'No file path provided for upload'
      };
    }
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`File not found at path: ${filePath}`);
      return {
        success: false,
        error: `File not found at path: ${filePath}`
      };
    }
    
    // Alternative method: Using stream instead of base64
    return new Promise<CloudinaryUploadResult>((resolve) => {
      const options: any = {
        folder: PRODUCT_IMAGES_FOLDER,
        resource_type: 'auto',
        // Optimize performance and reduce image size
        quality: 'auto',
        fetch_format: 'auto',
      };
  
      // Add public ID if provided
      if (publicId) {
        options.public_id = publicId;
      }
      
      // Use upload_stream method instead of upload
      // This method uploads the file as a stream instead of reading it entirely into memory
      const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          resolve({
            success: false,
            error: error.message || 'Unknown Cloudinary upload error',
          });
          return;
        }
        
        console.log('Image uploaded successfully to Cloudinary');
        console.log('Image URL:', result?.secure_url);
        console.log('Public ID:', result?.public_id);
        
        if (!result?.secure_url) {
          console.error('Warning: No secure_url returned from Cloudinary');
        }
        
        resolve({
          success: true,
          imageUrl: result?.secure_url,
          publicId: result?.public_id,
          format: result?.format,
          width: result?.width,
          height: result?.height,
        });
      });
      
      // Create a stream to read the file and pipe it to uploadStream
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(uploadStream);
      
      fileStream.on('error', (error: any) => {
        console.error('Error reading file:', error);
        resolve({
          success: false,
          error: `Error reading file: ${error.message}`,
        });
      });
    });
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    // Log detailed error information
    console.error('Upload error details:', JSON.stringify(error, null, 2));
    return {
      success: false,
      error: error.message || 'Unknown Cloudinary upload error',
    };
  }
};

/**
 * Delete an image from Cloudinary
 * @param publicId The public ID of the image
 * @returns Promise containing the deletion result
 */
export const deleteImage = async (publicId: string) => {
  try {
    // Only delete if there's a public ID
    if (!publicId) {
      return { success: false, error: 'No public ID provided' };
    }

    // Delete the image from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);
    
    return {
      success: result.result === 'ok',
      message: result.result,
    };
  } catch (error: any) {
    console.error('Cloudinary delete error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Extract the public ID from a Cloudinary image URL
 * @param url The Cloudinary image URL
 * @returns The public ID of the image, or empty string if URL is not from Cloudinary
 */
export const extractPublicIdFromUrl = (url: string): string => {
  if (!url || !url.includes('cloudinary.com')) {
    return '';
  }
  
  try {
    // Extract the public ID from the URL
    // Example: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/public_id.jpg
    const matches = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
    return matches ? matches[1] : '';
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return '';
  }
};

// Export the cloudinary object for direct use if needed
export { cloudinary };