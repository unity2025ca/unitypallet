import twilio from 'twilio';

// Check for required environment variables
if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
  console.error('Missing required Twilio environment variables');
}

// Create Twilio client only if environment variables are valid
let client: twilio.Twilio | null = null;

try {
  // Verify that the account SID starts with 'AC'
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
 * Function to send an SMS to a specific phone number
 * @param to Recipient phone number (in international format, e.g., +1234567890)
 * @param body Message text
 * @returns Promise containing information about the sent message
 */
export async function sendSMS(to: string, body: string) {
  try {
    // Check if Twilio client exists
    if (!client) {
      console.error('Twilio client not initialized');
      return {
        success: false,
        error: 'Twilio client not initialized',
        message: 'SMS service is not configured correctly'
      };
    }
    
    // Validate and format phone number
    let formattedNumber = to.trim();
    if (!formattedNumber.startsWith('+')) {
      formattedNumber = '+' + formattedNumber;
      console.log(`Reformatted phone number to international format: ${formattedNumber}`);
    }
    
    console.log(`Attempting to send SMS to ${formattedNumber} using Twilio number ${process.env.TWILIO_PHONE_NUMBER}`);
    console.log(`SMS content: "${body.substring(0, 50)}${body.length > 50 ? '...' : ''}"`);
    
    // Since we've already verified that client is not null, we can safely use it
    const message = await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: formattedNumber
    });
    
    console.log(`SMS sent successfully to ${formattedNumber}. Message SID: ${message.sid}`);
    
    return {
      success: true,
      messageId: message.sid,
      message: 'Message sent successfully',
      to: formattedNumber
    };
  } catch (error: any) {
    console.error(`Error sending SMS to ${to}:`, error.message);
    
    // Provide more detailed error information
    const errorDetails = {
      code: error.code || 'unknown',
      status: error.status || 'unknown',
      moreInfo: error.moreInfo || 'No additional information',
      details: error.details || []
    };
    
    console.error('Detailed SMS error:', JSON.stringify(errorDetails, null, 2));
    
    return {
      success: false,
      error: error.message,
      errorDetails,
      message: 'Failed to send message',
      to
    };
  }
}

/**
 * Function to send an SMS to multiple phone numbers
 * @param to Array of recipient phone numbers (in international format)
 * @param body Message text
 * @returns Promise containing information about the sent messages
 */
export async function sendBulkSMS(to: string[], body: string) {
  const results = [];
  
  // Check if Twilio client exists
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
      // Since we've already verified that client is not null, we can safely use it
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