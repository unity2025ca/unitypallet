import twilio from 'twilio';

// التحقق من وجود متغيرات البيئة المطلوبة
if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
  console.error('Missing required Twilio environment variables');
}

// إنشاء عميل Twilio
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * وظيفة لإرسال رسالة نصية إلى رقم هاتف محدد
 * @param to رقم الهاتف المستلم (بتنسيق دولي، مثل +1234567890)
 * @param body نص الرسالة
 * @returns وعد يحتوي على معلومات الرسالة المرسلة
 */
export async function sendSMS(to: string, body: string) {
  try {
    const message = await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
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
  
  for (const recipient of to) {
    try {
      const message = await client.messages.create({
        body,
        from: process.env.TWILIO_PHONE_NUMBER,
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