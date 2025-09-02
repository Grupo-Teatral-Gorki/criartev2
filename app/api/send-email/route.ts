import { NextRequest, NextResponse } from 'next/server';

// Using Resend as the email service (you can switch to SendGrid or others)
// Install: npm install resend
// Alternative: npm install @sendgrid/mail

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  projectTitle?: string;
  projectType?: string;
  userName?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: EmailRequest = await request.json();
    const { to, subject, html } = body;

    // Validate required fields
    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, html' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Option 1: Using Resend (Recommended)
    if (process.env.RESEND_API_KEY) {
      const { Resend } = require('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);

      const result = await resend.emails.send({
        from: process.env.FROM_EMAIL || 'noreply@criarte.com',
        to: [to],
        subject: subject,
        html: html,
      });

      if (result.error) {
        console.error('Resend error:', result.error);
        return NextResponse.json(
          { error: 'Failed to send email via Resend' },
          { status: 500 }
        );
      }

      return NextResponse.json({ 
        success: true, 
        messageId: result.data?.id,
        service: 'resend'
      });
    }

    // Option 2: Using SendGrid
    if (process.env.SENDGRID_API_KEY) {
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);

      const msg = {
        to: to,
        from: process.env.FROM_EMAIL || 'noreply@criarte.com',
        subject: subject,
        html: html,
      };

      const result = await sgMail.send(msg);
      
      return NextResponse.json({ 
        success: true, 
        messageId: result[0].headers['x-message-id'],
        service: 'sendgrid'
      });
    }

    // Option 3: Using Nodemailer with Gmail SMTP (Fallback)
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      const nodemailer = require('nodemailer');

      const transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD, // Use App Password, not regular password
        },
      });

      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: to,
        subject: subject,
        html: html,
      };

      const result = await transporter.sendMail(mailOptions);
      
      return NextResponse.json({ 
        success: true, 
        messageId: result.messageId,
        service: 'gmail'
      });
    }

    // No email service configured
    return NextResponse.json(
      { 
        error: 'No email service configured. Please set up RESEND_API_KEY, SENDGRID_API_KEY, or Gmail credentials in environment variables.' 
      },
      { status: 500 }
    );

  } catch (error) {
    console.error('Email API error:', error);
    return NextResponse.json(
      { error: 'Internal server error while sending email' },
      { status: 500 }
    );
  }
}
