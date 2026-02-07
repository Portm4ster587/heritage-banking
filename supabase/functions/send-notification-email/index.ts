import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface EmailRequest {
  to: string;
  subject: string;
  type: 'transfer' | 'deposit' | 'withdrawal' | 'application' | 'alert' | 'welcome' | 'verification' | 'wire' | 'ach' | 'balance';
  data: {
    amount?: number;
    recipientName?: string;
    transactionId?: string;
    status?: string;
    userName?: string;
    applicationType?: string;
    message?: string;
    currency?: string;
    usdValue?: number;
    transactionHash?: string;
    date?: string;
    newBalance?: number;
    accountType?: string;
  };
}

const heritageHeader = `
  <div style="background: linear-gradient(135deg, #0a1628 0%, #1e3a5f 100%); padding: 32px 24px; text-align: center; border-radius: 12px 12px 0 0;">
    <div style="display: inline-block; background: linear-gradient(135deg, #d4af37, #f5d060, #d4af37); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 32px; font-weight: 800; letter-spacing: 2px; font-family: Georgia, 'Times New Roman', serif;">
      HERITAGE
    </div>
    <div style="color: #d4af37; font-size: 11px; letter-spacing: 4px; text-transform: uppercase; margin-top: 4px; font-family: Georgia, serif;">
      Investment Holdings
    </div>
    <div style="width: 60px; height: 2px; background: linear-gradient(90deg, transparent, #d4af37, transparent); margin: 12px auto 0;"></div>
  </div>
`;

const heritageFooter = `
  <div style="background: #0a1628; padding: 24px; text-align: center; border-radius: 0 0 12px 12px;">
    <p style="color: #d4af37; font-size: 11px; margin: 0 0 8px; letter-spacing: 1px;">HERITAGE INVESTMENT HOLDINGS</p>
    <p style="color: #8899aa; font-size: 10px; margin: 0 0 4px;">FDIC Insured · Equal Housing Lender · NMLS# 123456</p>
    <p style="color: #8899aa; font-size: 10px; margin: 0 0 4px;">1 Heritage Plaza, Suite 1000, New York, NY 10001</p>
    <p style="color: #556677; font-size: 9px; margin: 12px 0 0;">
      This is an automated notification. Do not reply to this email.
      <br/>If you did not authorize this activity, call 1-800-HERITAGE immediately.
    </p>
    <p style="color: #556677; font-size: 9px; margin: 8px 0 0;">&copy; ${new Date().getFullYear()} Heritage Investment Holdings. All rights reserved.</p>
  </div>
`;

const contentWrap = (inner: string) => `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #0d1e36; border-radius: 12px; overflow: hidden; border: 1px solid #1e3a5f;">
    ${heritageHeader}
    <div style="background: #ffffff; padding: 32px 28px; color: #1f2937;">
      ${inner}
    </div>
    ${heritageFooter}
  </div>
`;

const amountBox = (label: string, data: EmailRequest['data']) => `
  <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d4af37;">
    ${data.amount != null ? `<p style="margin: 4px 0; font-size: 14px;"><strong>Amount:</strong> $${data.amount.toLocaleString()}</p>` : ''}
    ${data.recipientName ? `<p style="margin: 4px 0; font-size: 14px;"><strong>Recipient:</strong> ${data.recipientName}</p>` : ''}
    ${data.accountType ? `<p style="margin: 4px 0; font-size: 14px;"><strong>Account:</strong> ${data.accountType}</p>` : ''}
    ${data.transactionId ? `<p style="margin: 4px 0; font-size: 14px;"><strong>Reference:</strong> <code style="background:#f0f0f0; padding:2px 6px; border-radius:4px; font-size:12px;">${data.transactionId}</code></p>` : ''}
    ${data.status ? `<p style="margin: 4px 0; font-size: 14px;"><strong>Status:</strong> <span style="color: ${data.status === 'completed' || data.status === 'approved' ? '#22c55e' : data.status === 'rejected' ? '#ef4444' : '#eab308'}; font-weight:600;">${data.status.toUpperCase()}</span></p>` : ''}
    ${data.newBalance != null ? `<p style="margin: 4px 0; font-size: 14px;"><strong>New Balance:</strong> $${data.newBalance.toLocaleString()}</p>` : ''}
    ${data.date ? `<p style="margin: 4px 0; font-size: 14px;"><strong>Date:</strong> ${data.date}</p>` : ''}
  </div>
`;

const getEmailTemplate = (type: string, data: EmailRequest['data']) => {
  switch (type) {
    case 'transfer':
      return contentWrap(`
        <h2 style="color: #1e3a5f; margin: 0 0 16px; font-family: Georgia, serif;">Transfer ${data.status === 'completed' ? 'Completed ✓' : 'Update'}</h2>
        <p style="color: #4b5563;">Dear ${data.userName || 'Valued Client'},</p>
        <p style="color: #4b5563;">Your Heritage transfer has been processed successfully.</p>
        ${amountBox('Transfer Details', data)}
        <p style="color: #6b7280; font-size: 13px;">If you did not authorize this transaction, please contact us immediately at <strong>1-800-HERITAGE</strong>.</p>
      `);

    case 'deposit':
      return contentWrap(`
        <h2 style="color: #1e3a5f; margin: 0 0 16px; font-family: Georgia, serif;">💰 Deposit ${data.status || 'Received'}</h2>
        <p style="color: #4b5563;">Dear ${data.userName || 'Valued Client'},</p>
        <p style="color: #4b5563;">Your deposit has been ${data.status === 'completed' || data.status === 'approved' ? 'approved and credited to your account' : 'received and is being processed'}.</p>
        ${amountBox('Deposit Details', data)}
        ${data.message ? `<p style="color: #6b7280; font-size: 13px;">${data.message}</p>` : ''}
      `);

    case 'withdrawal':
      return contentWrap(`
        <h2 style="color: #1e3a5f; margin: 0 0 16px; font-family: Georgia, serif;">📤 Withdrawal ${data.status || 'Processed'}</h2>
        <p style="color: #4b5563;">Dear ${data.userName || 'Valued Client'},</p>
        <p style="color: #4b5563;">Your withdrawal request has been ${data.status}.</p>
        ${amountBox('Withdrawal Details', data)}
      `);

    case 'wire':
      return contentWrap(`
        <h2 style="color: #1e3a5f; margin: 0 0 16px; font-family: Georgia, serif;">🌐 Wire Transfer ${data.status === 'completed' ? 'Completed' : 'Update'}</h2>
        <p style="color: #4b5563;">Dear ${data.userName || 'Valued Client'},</p>
        <p style="color: #4b5563;">Your wire transfer has been ${data.status}.</p>
        ${amountBox('Wire Transfer Details', data)}
        <p style="color: #6b7280; font-size: 13px;">Wire transfers are typically processed within 24 hours.</p>
      `);

    case 'ach':
      return contentWrap(`
        <h2 style="color: #1e3a5f; margin: 0 0 16px; font-family: Georgia, serif;">🏦 ACH Transfer ${data.status === 'completed' ? 'Completed' : 'Update'}</h2>
        <p style="color: #4b5563;">Dear ${data.userName || 'Valued Client'},</p>
        <p style="color: #4b5563;">Your ACH transfer has been ${data.status}.</p>
        ${amountBox('ACH Details', data)}
      `);

    case 'balance':
      return contentWrap(`
        <h2 style="color: #1e3a5f; margin: 0 0 16px; font-family: Georgia, serif;">💵 Account Balance Update</h2>
        <p style="color: #4b5563;">Dear ${data.userName || 'Valued Client'},</p>
        <p style="color: #4b5563;">Your account balance has been updated.</p>
        ${amountBox('Balance Update', data)}
      `);

    case 'alert':
      return contentWrap(`
        <h2 style="color: #dc2626; margin: 0 0 16px; font-family: Georgia, serif;">⚠️ Security Alert</h2>
        <p style="color: #4b5563;">Dear ${data.userName || 'Valued Client'},</p>
        <p style="color: #4b5563;">${data.message || 'We detected unusual activity on your account.'}</p>
        <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #991b1b; margin: 0; font-size: 14px;">If you did not initiate this activity, contact us immediately at <strong>1-800-HERITAGE</strong>.</p>
        </div>
      `);

    case 'welcome':
      return contentWrap(`
        <h2 style="color: #1e3a5f; margin: 0 0 16px; font-family: Georgia, serif;">Welcome to Heritage, ${data.userName}!</h2>
        <p style="color: #4b5563;">Thank you for choosing Heritage Investment Holdings. Your account has been created successfully.</p>
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1e3a5f;">
          <h3 style="margin: 0 0 12px; color: #1e3a5f;">Getting Started</h3>
          <ul style="color: #4b5563; margin: 0; padding-left: 20px; font-size: 14px;">
            <li style="margin-bottom: 8px;">Complete your ID verification for full access</li>
            <li style="margin-bottom: 8px;">Set up direct deposit</li>
            <li style="margin-bottom: 8px;">Enable two-factor authentication</li>
            <li>Explore our crypto ecosystem</li>
          </ul>
        </div>
      `);

    case 'verification':
      return contentWrap(`
        <h2 style="color: #1e3a5f; margin: 0 0 16px; font-family: Georgia, serif;">🔐 Verification ${data.status}</h2>
        <p style="color: #4b5563;">Dear ${data.userName || 'Valued Client'},</p>
        <p style="color: #4b5563;">Your identity verification has been <strong>${data.status}</strong>.</p>
        ${data.status === 'verified' ? '<p style="color: #22c55e; font-weight: 600;">You now have full access to all Heritage Bank features.</p>' : ''}
        ${data.message ? `<p style="color: #6b7280; font-size: 13px;">${data.message}</p>` : ''}
      `);

    default:
      return contentWrap(`
        <p style="color: #4b5563;">${data.message || 'You have a new notification from Heritage Bank.'}</p>
      `);
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, type, data }: EmailRequest = await req.json();

    if (!to || !subject) {
      console.error('Missing required fields: to or subject');
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Sending ${type} email to ${to} - Subject: ${subject}`);

    const html = getEmailTemplate(type, data);

    const emailResponse = await resend.emails.send({
      from: "Heritage Bank <onboarding@resend.dev>",
      to: [to],
      subject: `Heritage Bank - ${subject}`,
      html: html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, ...emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
