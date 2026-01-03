import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  type: 'transfer' | 'deposit' | 'withdrawal' | 'application' | 'alert' | 'welcome' | 'verification';
  data: {
    amount?: number;
    recipientName?: string;
    transactionId?: string;
    status?: string;
    userName?: string;
    applicationType?: string;
    message?: string;
  };
}

const getEmailTemplate = (type: string, data: EmailRequest['data']) => {
  const logoUrl = 'https://jiahyspsvgfvyvgoffwr.supabase.co/storage/v1/object/public/assets/heritage-logo.png';
  const baseStyles = `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
    border-radius: 12px;
  `;

  const headerStyles = `
    background: #0d1e4a;
    padding: 30px;
    text-align: center;
    border-radius: 8px 8px 0 0;
  `;

  const contentStyles = `
    background: #ffffff;
    padding: 30px;
    border-radius: 0 0 8px 8px;
    color: #1f2937;
  `;

  const footerStyles = `
    text-align: center;
    color: #d4af37;
    padding: 20px;
    font-size: 12px;
  `;

  switch (type) {
    case 'transfer':
      return `
        <div style="${baseStyles}">
          <div style="${headerStyles}">
            <h1 style="color: #d4af37; margin: 0; font-size: 24px;">Heritage Bank</h1>
            <p style="color: #ffffff; margin: 10px 0 0 0;">Transfer Notification</p>
          </div>
          <div style="${contentStyles}">
            <h2 style="color: #1e3a8a; margin-top: 0;">Transfer ${data.status === 'completed' ? 'Completed' : 'Update'}</h2>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Amount:</strong> $${data.amount?.toLocaleString() || '0.00'}</p>
              ${data.recipientName ? `<p style="margin: 5px 0;"><strong>Recipient:</strong> ${data.recipientName}</p>` : ''}
              <p style="margin: 5px 0;"><strong>Transaction ID:</strong> ${data.transactionId || 'N/A'}</p>
              <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: ${data.status === 'completed' ? '#22c55e' : '#eab308'};">${data.status?.toUpperCase()}</span></p>
            </div>
            <p style="color: #6b7280; font-size: 14px;">If you did not authorize this transaction, please contact us immediately.</p>
          </div>
          <div style="${footerStyles}">
            <p>&copy; 2024 Heritage Bank. All rights reserved.</p>
            <p>FDIC Insured | Equal Housing Lender</p>
          </div>
        </div>
      `;

    case 'deposit':
      return `
        <div style="${baseStyles}">
          <div style="${headerStyles}">
            <h1 style="color: #d4af37; margin: 0; font-size: 24px;">Heritage Bank</h1>
            <p style="color: #ffffff; margin: 10px 0 0 0;">Deposit Notification</p>
          </div>
          <div style="${contentStyles}">
            <h2 style="color: #1e3a8a; margin-top: 0;">Deposit ${data.status}</h2>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Amount:</strong> $${data.amount?.toLocaleString() || '0.00'}</p>
              <p style="margin: 5px 0;"><strong>Reference:</strong> ${data.transactionId || 'N/A'}</p>
              <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: ${data.status === 'approved' ? '#22c55e' : '#ef4444'};">${data.status?.toUpperCase()}</span></p>
            </div>
            ${data.message ? `<p style="color: #6b7280;">${data.message}</p>` : ''}
          </div>
          <div style="${footerStyles}">
            <p>&copy; 2024 Heritage Bank. All rights reserved.</p>
          </div>
        </div>
      `;

    case 'withdrawal':
      return `
        <div style="${baseStyles}">
          <div style="${headerStyles}">
            <h1 style="color: #d4af37; margin: 0; font-size: 24px;">Heritage Bank</h1>
            <p style="color: #ffffff; margin: 10px 0 0 0;">Withdrawal Notification</p>
          </div>
          <div style="${contentStyles}">
            <h2 style="color: #1e3a8a; margin-top: 0;">Withdrawal ${data.status}</h2>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Amount:</strong> $${data.amount?.toLocaleString() || '0.00'}</p>
              <p style="margin: 5px 0;"><strong>Reference:</strong> ${data.transactionId || 'N/A'}</p>
              <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: ${data.status === 'approved' ? '#22c55e' : '#ef4444'};">${data.status?.toUpperCase()}</span></p>
            </div>
            ${data.message ? `<p style="color: #6b7280;">${data.message}</p>` : ''}
          </div>
          <div style="${footerStyles}">
            <p>&copy; 2024 Heritage Bank. All rights reserved.</p>
          </div>
        </div>
      `;

    case 'application':
      return `
        <div style="${baseStyles}">
          <div style="${headerStyles}">
            <h1 style="color: #d4af37; margin: 0; font-size: 24px;">Heritage Bank</h1>
            <p style="color: #ffffff; margin: 10px 0 0 0;">Application Update</p>
          </div>
          <div style="${contentStyles}">
            <h2 style="color: #1e3a8a; margin-top: 0;">Application ${data.status}</h2>
            <p>Dear ${data.userName || 'Valued Customer'},</p>
            <p>Your ${data.applicationType || 'account'} application has been <strong>${data.status}</strong>.</p>
            ${data.message ? `<p style="color: #6b7280;">${data.message}</p>` : ''}
            <p>Log in to your Heritage Bank account for more details.</p>
          </div>
          <div style="${footerStyles}">
            <p>&copy; 2024 Heritage Bank. All rights reserved.</p>
          </div>
        </div>
      `;

    case 'alert':
      return `
        <div style="${baseStyles}">
          <div style="${headerStyles}">
            <h1 style="color: #d4af37; margin: 0; font-size: 24px;">Heritage Bank</h1>
            <p style="color: #ffffff; margin: 10px 0 0 0;">Security Alert</p>
          </div>
          <div style="${contentStyles}">
            <h2 style="color: #ef4444; margin-top: 0;">⚠️ Security Alert</h2>
            <p>Dear ${data.userName || 'Valued Customer'},</p>
            <p>${data.message || 'We detected unusual activity on your account.'}</p>
            <p style="color: #6b7280; font-size: 14px;">If you did not initiate this activity, please contact us immediately at 1-800-HERITAGE.</p>
          </div>
          <div style="${footerStyles}">
            <p>&copy; 2024 Heritage Bank. All rights reserved.</p>
          </div>
        </div>
      `;

    case 'welcome':
      return `
        <div style="${baseStyles}">
          <div style="${headerStyles}">
            <h1 style="color: #d4af37; margin: 0; font-size: 24px;">Heritage Bank</h1>
            <p style="color: #ffffff; margin: 10px 0 0 0;">Welcome to Heritage Bank</p>
          </div>
          <div style="${contentStyles}">
            <h2 style="color: #1e3a8a; margin-top: 0;">Welcome, ${data.userName}!</h2>
            <p>Thank you for choosing Heritage Bank. Your account has been successfully created.</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1e3a8a;">Getting Started</h3>
              <ul style="color: #6b7280;">
                <li>Complete your ID verification for full access</li>
                <li>Set up direct deposit</li>
                <li>Enable two-factor authentication</li>
                <li>Explore our mobile banking features</li>
              </ul>
            </div>
          </div>
          <div style="${footerStyles}">
            <p>&copy; 2024 Heritage Bank. All rights reserved.</p>
          </div>
        </div>
      `;

    case 'verification':
      return `
        <div style="${baseStyles}">
          <div style="${headerStyles}">
            <h1 style="color: #d4af37; margin: 0; font-size: 24px;">Heritage Bank</h1>
            <p style="color: #ffffff; margin: 10px 0 0 0;">Verification Update</p>
          </div>
          <div style="${contentStyles}">
            <h2 style="color: #1e3a8a; margin-top: 0;">Identity Verification ${data.status}</h2>
            <p>Dear ${data.userName || 'Valued Customer'},</p>
            <p>Your identity verification has been <strong>${data.status}</strong>.</p>
            ${data.message ? `<p style="color: #6b7280;">${data.message}</p>` : ''}
            ${data.status === 'verified' ? '<p style="color: #22c55e;">You now have full access to all Heritage Bank features.</p>' : ''}
          </div>
          <div style="${footerStyles}">
            <p>&copy; 2024 Heritage Bank. All rights reserved.</p>
          </div>
        </div>
      `;

    default:
      return `
        <div style="${baseStyles}">
          <div style="${headerStyles}">
            <h1 style="color: #d4af37; margin: 0; font-size: 24px;">Heritage Bank</h1>
          </div>
          <div style="${contentStyles}">
            <p>${data.message || 'You have a new notification from Heritage Bank.'}</p>
          </div>
          <div style="${footerStyles}">
            <p>&copy; 2024 Heritage Bank. All rights reserved.</p>
          </div>
        </div>
      `;
  }
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, type, data }: EmailRequest = await req.json();

    console.log(`Sending ${type} email to ${to}`);

    const html = getEmailTemplate(type, data);

    const emailResponse = await resend.emails.send({
      from: "Heritage Bank <onboarding@resend.dev>",
      to: [to],
      subject: subject,
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
