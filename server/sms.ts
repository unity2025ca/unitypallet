import twilio from 'twilio';

// التحقق من وجود متغيرات البيئة المطلوبة
if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
  console.error('Missing required Twilio environment variables');
}

// إنشاء عميل Twilio فقط إذا كانت المتغيرات البيئية صحيحة
let client: twilio.Twilio | null = null;

try {
  // التحقق من أن معرف الحساب يبدأ بـ AC
  const accountSid = process.env.TWILIO_ACCOUNT_SID || '';
  if (accountSid && accountSid.startsWith('AC')) {
    client = twilio(accountSid, process.env.TWILIO_AUTH_TOKEN || '');
    console.log('Twilio client initialized successfully');
  } else {
    console.error('Twilio account SID must start with "AC"');
  }
} catch (error) {
  console.error('Error initializing Twilio client:', error);
}

/**
 * وظيفة لإرسال رسالة نصية إلى رقم هاتف محدد
 * @param to رقم الهاتف المستلم (بتنسيق دولي، مثل +1234567890)
 * @param body نص الرسالة
 * @returns وعد يحتوي على معلومات الرسالة المرسلة
 */
export async function sendSMS(to: string, body: string) {
  try {
    // التحقق من وجود عميل Twilio
    if (!client) {
      console.error('Twilio client not initialized');
      return {
        success: false,
        error: 'Twilio client not initialized',
        message: 'SMS service is not configured correctly'
      };
    }
    
    // نظرًا لأننا تحققنا بالفعل أن client ليس null، يمكننا استخدامه بأمان
    const message = await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to
    });
    
    return {
      success: true,
      messageId: message.sid,
      message: 'Message sent successfully'
    };
  } catch (error: any) {
    console.error('Error sending SMS:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to send message'
    };
  }
}

/**
 * وظيفة لإرسال رسالة نصية إلى عدة أرقام هواتف
 * @param to مصفوفة من أرقام الهواتف المستلمة (بتنسيق دولي)
 * @param body نص الرسالة
 * @returns وعد يحتوي على معلومات الرسائل المرسلة
 */
export async function sendBulkSMS(to: string[], body: string) {
  const results = [];
  
  // التحقق من وجود عميل Twilio
  if (!client) {
    console.error('Twilio client not initialized');
    return to.map(recipient => ({
      to: recipient,
      success: false,
      error: 'Twilio client not initialized',
      message: 'SMS service is not configured correctly'
    }));
  }
  
  for (const recipient of to) {
    try {
      // نظرًا لأننا تحققنا بالفعل أن client ليس null، يمكننا استخدامه بأمان
      const message = await client.messages.create({
        body,
        from: process.env.TWILIO_PHONE_NUMBER!,
        to: recipient
      });
      
      results.push({
        to: recipient,
        success: true,
        messageId: message.sid
      });
    } catch (error: any) {
      results.push({
        to: recipient,
        success: false,
        error: error.message
      });
    }
  }
  
  return results;
}