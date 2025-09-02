import { NextRequest, NextResponse } from 'next/server';
import EmailService from '../../services/emailService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userEmail, userName, testType } = body;

    // Validate required fields
    if (!userEmail || !userName) {
      return NextResponse.json(
        { error: 'Missing required fields: userEmail, userName' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const emailService = EmailService.getInstance();
    let result = false;

    // Always send test emails to criarte@grupoteatralgorki.com
    const testEmailAddress = 'criarte@grupoteatralgorki.com';

    if (testType === 'project_created') {
      result = await emailService.sendProjectCreatedEmail(
        testEmailAddress,
        userName,
        'Projeto de Teste - Criação',
        'fomento'
      );
    } else if (testType === 'project_submitted') {
      result = await emailService.sendProjectSubmittedEmail(
        testEmailAddress,
        userName,
        'Projeto de Teste - Envio',
        'fomento',
        new Date()
      );
    } else {
      return NextResponse.json(
        { error: 'Invalid test type. Use "project_created" or "project_submitted"' },
        { status: 400 }
      );
    }

    if (result) {
      return NextResponse.json({ 
        success: true, 
        message: `Test email (${testType}) sent successfully to ${testEmailAddress}` 
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to send test email' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Test email API error:', error);
    return NextResponse.json(
      { error: 'Internal server error while sending test email' },
      { status: 500 }
    );
  }
}
