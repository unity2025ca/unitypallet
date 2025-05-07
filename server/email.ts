import { MailService } from '@sendgrid/mail';
import { MailDataRequired } from '@sendgrid/helpers/classes/mail';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY as string);

interface EmailParams {
  to: string | string[];
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(
  params: EmailParams
): Promise<boolean> {
  try {
    console.log('Preparing to send email with params:', {
      to: Array.isArray(params.to) ? `${params.to.length} recipients` : params.to,
      from: params.from,
      subject: params.subject,
      hasText: !!params.text,
      hasHtml: !!params.html
    });

    // Create more effective email structure to avoid spam filters
    const msg = {
      to: params.to,
      from: {
        email: params.from,
        name: "Unity Pallets" // Using store name improves deliverability
      },
      subject: params.subject,
      // Setting these spam prevention headers
      headers: {
        "List-Unsubscribe": "<https://unitypallets.com/unsubscribe>",
        "Precedence": "Bulk"
      },
      // Categories help with tracking in SendGrid
      categories: ["newsletter"],
      // Using SendGrid tracking features
      trackingSettings: {
        clickTracking: { enable: true },
        openTracking: { enable: true },
        subscriptionTracking: { enable: false }
      }
    } as any;

    if (params.text) msg.text = params.text;
    if (params.html) {
      // Add proper HTML structure if missing
      let htmlContent = params.html;
      
      if (!htmlContent.includes("<!DOCTYPE html>")) {
        htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${params.subject}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  ${htmlContent}
  <br><br>
  <p style="font-size: 12px; color: #777;">
    You received this email because you subscribed to updates from Unity Pallets.
    <br>
    If you no longer wish to receive these emails, you can <a href="https://unitypallets.com/unsubscribe" style="color: #777;">unsubscribe here</a>.
  </p>
</body>
</html>`;
      }
      
      msg.html = htmlContent;
    }

    console.log('Sending email via SendGrid...');
    const result = await mailService.send(msg);
    console.log('SendGrid response:', result);
    return true;
  } catch (error: any) {
    console.error('SendGrid email error details:', error);
    if (error.response) {
      console.error('SendGrid API response error:', {
        body: error.response.body,
        statusCode: error.response.statusCode
      });
    }
    return false;
  }
}

export async function sendBulkEmails(
  emails: string[],
  from: string,
  subject: string,
  content: string,
  isHtml: boolean = false
): Promise<{ success: boolean; message: string }> {
  if (!emails.length) {
    return { success: false, message: 'No recipient emails provided' };
  }

  console.log(`Starting bulk email send to ${emails.length} recipients`);
  console.log(`From: ${from}, Subject: ${subject}, Content type: ${isHtml ? 'HTML' : 'Text'}`);
  
  try {
    // Verify that sender address is a valid email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(from)) {
      console.error('Invalid sender email format:', from);
      return { 
        success: false, 
        message: `Invalid sender email format: ${from}` 
      };
    }
    
    // Split emails into chunks of 900 (under SendGrid's 1000 limit)
    const chunkSize = 900;
    const emailChunks = [];
    
    for (let i = 0; i < emails.length; i += chunkSize) {
      emailChunks.push(emails.slice(i, i + chunkSize));
    }
    
    console.log(`Split recipients into ${emailChunks.length} chunks`);
    
    // Send emails to each chunk
    let successCount = 0;
    let failureCount = 0;
    
    for (let i = 0; i < emailChunks.length; i++) {
      const chunk = emailChunks[i];
      console.log(`Sending chunk ${i + 1}/${emailChunks.length} with ${chunk.length} recipients`);
      
      const emailParams = {
        to: chunk,
        from,
        subject,
        ...(isHtml ? { html: content } : { text: content })
      };
      
      const success = await sendEmail(emailParams);
      
      if (success) {
        successCount += chunk.length;
        console.log(`Successfully sent to chunk ${i + 1}/${emailChunks.length}`);
      } else {
        failureCount += chunk.length;
        console.error(`Failed to send to chunk ${i + 1}/${emailChunks.length}`);
      }
    }
    
    if (failureCount > 0) {
      const message = `Partial success: sent to ${successCount} of ${emails.length} subscribers (${failureCount} failed)`;
      console.warn(message);
      return { 
        success: successCount > 0, 
        message
      };
    }
    
    const message = `Email sent successfully to ${emails.length} subscribers`;
    console.log(message);
    return { 
      success: true, 
      message
    };
  } catch (error: any) {
    console.error('Bulk email error:', error);
    return { 
      success: false, 
      message: `Failed to send emails: ${error.message || 'Unknown error'}` 
    };
  }
}