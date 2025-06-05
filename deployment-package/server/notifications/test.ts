import { sendEmail } from "../email";
import { sendSMS } from "../sms";

/**
 * Test notification services by sending test messages
 * @param email Target email address for test
 * @param phone Target phone number for test
 * @returns Results of test operations
 */
export async function testNotificationServices(email?: string, phone?: string) {
  const results = {
    email: { tested: false, success: false, error: null as string | null },
    sms: { tested: false, success: false, error: null as string | null }
  };
  
  // Test email if provided
  if (email) {
    results.email.tested = true;
    
    try {
      console.log(`Testing email service by sending test message to ${email}`);
      
      const emailResult = await sendEmail({
        to: email,
        from: "test@unity-pallets.com",
        subject: "Unity Pallets - Notification Test",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #e50000;">Unity Pallets Notification Test</h1>
            <p>This is a test email to verify that our notification system is working correctly.</p>
            <p>If you received this email, it means our email delivery system is functioning properly.</p>
            <p>Time sent: ${new Date().toLocaleString()}</p>
            <p>Thank you for your assistance in testing our system.</p>
            <div style="margin-top: 30px; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
              <p style="margin: 0; font-size: 12px; color: #777;">
                This is an automated test message. Please do not reply.
              </p>
            </div>
          </div>
        `
      });
      
      results.email.success = emailResult;
      
      if (!emailResult) {
        results.email.error = "Email delivery failed - check SendGrid API key and configuration";
      }
    } catch (error: any) {
      results.email.success = false;
      results.email.error = error.message || "Unknown error during email test";
      console.error("Email test error:", error);
    }
  }
  
  // Test SMS if provided
  if (phone) {
    results.sms.tested = true;
    
    try {
      console.log(`Testing SMS service by sending test message to ${phone}`);
      
      // Format phone number if needed
      let formattedPhone = phone.trim();
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+' + formattedPhone;
      }
      
      const smsResult = await sendSMS(
        formattedPhone,
        `Unity Pallets notification test - This is a test message sent at ${new Date().toLocaleString()} to verify our SMS system is working correctly.`
      );
      
      results.sms.success = smsResult.success;
      
      if (!smsResult.success) {
        results.sms.error = smsResult.error || "SMS delivery failed - check Twilio API key and configuration";
      }
    } catch (error: any) {
      results.sms.success = false;
      results.sms.error = error.message || "Unknown error during SMS test";
      console.error("SMS test error:", error);
    }
  }
  
  return results;
}