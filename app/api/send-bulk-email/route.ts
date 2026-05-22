import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { firestore } from '@/app/config/firebaseAdmin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cityId, subject, bodyHtml } = body;

    if (!cityId || !subject || !bodyHtml) {
      return NextResponse.json(
        { error: 'Missing required fields: cityId, subject, bodyHtml' },
        { status: 400 }
      );
    }

    // Fetch all users for the given cityId
    const usersSnapshot = await firestore
      .collection('users')
      .where('cityId', '==', cityId)
      .get();

    if (usersSnapshot.empty) {
      return NextResponse.json(
        { error: 'Nenhum usuário encontrado para esta cidade.' },
        { status: 404 }
      );
    }

    const emails: string[] = [];
    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.email && typeof data.email === 'string') {
        emails.push(data.email);
      }
    });

    if (emails.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum usuário com e-mail válido encontrado para esta cidade.' },
        { status: 404 }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const fromEmail = process.env.FROM_EMAIL || 'Criarte <noreply@grupogorki.com.br>';

    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    // Send emails in batches of 10 to avoid rate limits
    const BATCH_SIZE = 10;
    for (let i = 0; i < emails.length; i += BATCH_SIZE) {
      const batch = emails.slice(i, i + BATCH_SIZE);
      const results = await Promise.allSettled(
        batch.map((to) =>
          resend.emails.send({
            from: fromEmail,
            to,
            subject,
            html: bodyHtml,
          })
        )
      );

      results.forEach((result, idx) => {
        if (result.status === 'fulfilled' && !result.value.error) {
          success++;
        } else {
          failed++;
          const errorMsg =
            result.status === 'rejected'
              ? String(result.reason)
              : result.value.error?.message || 'Unknown error';
          errors.push(`${batch[idx]}: ${errorMsg}`);
        }
      });
    }

    console.log(
      `[BULK-EMAIL] cityId=${cityId} | total=${emails.length} | success=${success} | failed=${failed}`
    );

    return NextResponse.json({
      success: true,
      total: emails.length,
      sent: success,
      failed,
      ...(errors.length > 0 && { errors: errors.slice(0, 20) }),
    });
  } catch (error) {
    console.error('[BULK-EMAIL] Error:', error);
    return NextResponse.json(
      {
        error: 'Erro ao enviar e-mails.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
