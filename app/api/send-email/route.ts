import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, html } = body;

    console.log('[SEND-EMAIL API] Received request:', { to, subject: subject?.substring(0, 50) });
    console.log('[SEND-EMAIL API] Using FROM_EMAIL:', process.env.FROM_EMAIL);
    console.log('[SEND-EMAIL API] RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);

    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, html' },
        { status: 400 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'Criarte <noreply@grupogorki.com.br>',
      to,
      subject,
      html,
    });

    if (error) {
      console.error('[SEND-EMAIL API] Resend error:', JSON.stringify(error, null, 2));
      return NextResponse.json(
        { error: 'Failed to send email', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Email sent successfully',
      id: data?.id 
    });

  } catch (error) {
    console.error('Send email API error:', error);
    return NextResponse.json(
      { error: 'Failed to send email', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
