import { v2 as cloudinary } from 'cloudinary';

// التحقق من وجود متغيرات البيئة المطلوبة
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('Missing required Cloudinary environment variables');
}

// تكوين Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// المجلد الافتراضي لتخزين صور المنتجات
const PRODUCT_IMAGES_FOLDER = 'unity_ecommerce/products';

/**
 * رفع صورة إلى Cloudinary
 * @param filePath مسار الملف المؤقت على الخادم
 * @param publicId معرّف عام للصورة (اختياري)
 * @returns وعد يحتوي على نتيجة التحميل
 */
export const uploadImage = async (filePath: string, publicId?: string) => {
  try {
    const options: any = {
      folder: PRODUCT_IMAGES_FOLDER,
      resource_type: 'image',
      // تحسين للأداء وتقليل حجم الصورة
      quality: 'auto',
      fetch_format: 'auto',
    };

    // إضافة معرّف عام إذا تم توفيره
    if (publicId) {
      options.public_id = publicId;
    }

    // رفع الصورة إلى Cloudinary
    const result = await cloudinary.uploader.upload(filePath, options);
    
    return {
      success: true,
      imageUrl: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
    };
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * حذف صورة من Cloudinary
 * @param publicId المعرّف العام للصورة
 * @returns وعد يحتوي على نتيجة الحذف
 */
export const deleteImage = async (publicId: string) => {
  try {
    // نحذف فقط إذا كان هناك معرّف عام
    if (!publicId) {
      return { success: false, error: 'No public ID provided' };
    }

    // حذف الصورة من Cloudinary
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
 * استخراج المعرّف العام من عنوان URL للصورة
 * @param url عنوان URL للصورة من Cloudinary
 * @returns المعرّف العام للصورة، أو فراغ إذا لم يكن URL من Cloudinary
 */
export const extractPublicIdFromUrl = (url: string): string => {
  if (!url || !url.includes('cloudinary.com')) {
    return '';
  }
  
  try {
    // استخراج المعرّف العام من عنوان URL
    // مثال: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/public_id.jpg
    const matches = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
    return matches ? matches[1] : '';
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return '';
  }
};

// تصدير الكائن cloudinary للاستخدام المباشر إذا لزم الأمر
export { cloudinary };