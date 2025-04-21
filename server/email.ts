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
    const msg = {
      to: params.to,
      from: params.from,
      subject: params.subject,
    } as any;

    if (params.text) msg.text = params.text;
    if (params.html) msg.html = params.html;

    await mailService.send(msg);
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
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

  try {
    // Split emails into chunks of 1000 (SendGrid limit)
    const chunkSize = 900;
    const emailChunks = [];
    
    for (let i = 0; i < emails.length; i += chunkSize) {
      emailChunks.push(emails.slice(i, i + chunkSize));
    }
    
    // Send emails to each chunk
    for (const chunk of emailChunks) {
      await sendEmail({
        to: chunk,
        from,
        subject,
        ...(isHtml ? { html: content } : { text: content })
      });
    }
    
    return { 
      success: true, 
      message: `Email sent successfully to ${emails.length} subscribers` 
    };
  } catch (error) {
    console.error('Bulk email error:', error);
    return { 
      success: false, 
      message: `Failed to send emails: ${(error as Error).message}` 
    };
  }
}