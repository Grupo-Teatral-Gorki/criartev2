# Email Deliverability Setup Guide - Preventing Spam

## Problem
Firebase Authentication emails are going to spam folder.

## Solutions (Ordered by Effectiveness)

---

## Solution 1: Use Custom SMTP with SendGrid (Recommended)

### Why SendGrid?
- ✅ High deliverability rate (99%+)
- ✅ Professional email infrastructure
- ✅ Free tier: 100 emails/day
- ✅ Detailed analytics
- ✅ Automatic spam prevention

### Setup Steps:

#### 1. Create SendGrid Account
```
1. Go to https://sendgrid.com
2. Sign up for free account
3. Verify your email
4. Complete sender verification
```

#### 2. Get API Key
```
1. Settings → API Keys
2. Create API Key
3. Give it "Mail Send" permissions
4. Copy the key (save it securely!)
```

#### 3. Install Firebase Extension
```bash
# In your Firebase project directory
firebase ext:install sendgrid/firestore-send-email
```

#### 4. Configure Extension
```
SMTP Connection URI: smtp://apikey:YOUR_SENDGRID_API_KEY@smtp.sendgrid.net:587
Default FROM address: noreply@yourdomain.com
Default REPLY-TO address: suporte@criarte.com
```

#### 5. Update Password Reset Function

Create a Cloud Function to send custom emails:

```typescript
// functions/src/index.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as sgMail from '@sendgrid/mail';

admin.initializeApp();
sgMail.setApiKey(functions.config().sendgrid.key);

export const sendPasswordResetEmail = functions.https.onCall(async (data, context) => {
  const { email } = data;
  
  // Generate password reset link
  const link = await admin.auth().generatePasswordResetLink(email);
  
  const msg = {
    to: email,
    from: {
      email: 'noreply@criarte.com',
      name: 'Criarte - Sistema de Gestão Cultural'
    },
    subject: 'Redefinição de Senha - Criarte',
    text: `Para redefinir sua senha, acesse: ${link}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1d4a5d; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #1d4a5d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Criarte</h1>
              <p>Sistema de Gestão Cultural</p>
            </div>
            <div class="content">
              <h2>Redefinição de Senha</h2>
              <p>Olá,</p>
              <p>Você solicitou a redefinição de senha para sua conta Criarte.</p>
              <p>Para criar uma nova senha, clique no botão abaixo:</p>
              <p style="text-align: center;">
                <a href="${link}" class="button">Redefinir Senha</a>
              </p>
              <p><strong>Este link é válido por 1 hora.</strong></p>
              <p>Se você não fez esta solicitação, ignore este email. Sua senha permanecerá inalterada.</p>
              <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
              <p style="color: #666; font-size: 14px;">
                <strong>Dica de Segurança:</strong> Nunca compartilhe este link com outras pessoas.
              </p>
            </div>
            <div class="footer">
              <p>© 2024 Criarte. Todos os direitos reservados.</p>
              <p>Em caso de dúvidas, entre em contato: suporte@criarte.com</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
  
  await sgMail.send(msg);
  return { success: true };
});
```

#### 6. Update ForgotPasswordForm Component

```typescript
// Instead of using Firebase's sendPasswordResetEmail
// Call your Cloud Function

import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const sendPasswordReset = httpsCallable(functions, 'sendPasswordResetEmail');

try {
  await sendPasswordReset({ email });
  // Success handling
} catch (error) {
  // Error handling
}
```

---

## Solution 2: Domain Authentication (No Code Changes)

### Setup DNS Records

#### A. SPF Record
```
Type: TXT
Host: @
Value: v=spf1 include:_spf.google.com include:_spf.firebasemail.com ~all
TTL: 3600
```

#### B. DKIM Record
```
Type: TXT
Host: firebase1._domainkey
Value: [Get from Firebase Console → Authentication → Templates → Email Settings]
TTL: 3600
```

#### C. DMARC Record
```
Type: TXT
Host: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@yourdomain.com
TTL: 3600
```

#### D. Custom Domain Setup
```
1. Firebase Console → Authentication → Templates
2. Click "Customize domain"
3. Add your domain: criarte.com
4. Follow verification steps
5. Update sender email to: noreply@criarte.com
```

---

## Solution 3: Content Optimization

### Email Best Practices

#### ✅ DO:
- Use plain, professional language
- Include clear sender name
- Add physical address (optional but helps)
- Use proper HTML structure
- Include unsubscribe link (for marketing emails)
- Keep text-to-image ratio high
- Use your own domain

#### ❌ DON'T:
- Use ALL CAPS
- Add multiple exclamation marks
- Use spam trigger words (FREE, URGENT, CLICK HERE)
- Include too many links
- Use URL shorteners
- Send from generic domains
- Use excessive formatting

### Optimized Template

```
Subject: Redefinição de Senha - Criarte

Olá,

Você solicitou a redefinição de senha para sua conta no Sistema Criarte.

Para continuar, acesse o link abaixo:
[Link de Redefinição]

Este link é válido por 1 hora por motivos de segurança.

Se você não fez esta solicitação, pode ignorar este email com segurança.

Atenciosamente,
Equipe Criarte
Sistema de Gestão Cultural

---
Precisa de ajuda? Entre em contato: suporte@criarte.com
```

---

## Solution 4: Warm Up Your Domain

### Gradual Email Sending

If using a new domain:

1. **Week 1**: Send 50-100 emails/day
2. **Week 2**: Send 200-500 emails/day
3. **Week 3**: Send 1,000+ emails/day
4. **Week 4+**: Normal volume

This builds sender reputation gradually.

---

## Solution 5: Monitor and Improve

### Tools to Check Email Health

#### 1. Mail Tester
```
1. Go to https://www.mail-tester.com
2. Send test email to provided address
3. Check score (aim for 8+/10)
4. Follow recommendations
```

#### 2. Google Postmaster Tools
```
1. Go to https://postmaster.google.com
2. Add your domain
3. Monitor:
   - Spam rate
   - IP reputation
   - Domain reputation
   - Delivery errors
```

#### 3. MXToolbox
```
1. Go to https://mxtoolbox.com/blacklists.aspx
2. Check if your domain/IP is blacklisted
3. Request removal if needed
```

---

## Quick Fixes (Immediate)

### 1. Update Firebase Email Template

```
Subject: Redefinição de Senha - Criarte

Olá,

Você solicitou redefinir sua senha.

Link de redefinição: %LINK%

Válido por 1 hora.

Se não foi você, ignore este email.

Equipe Criarte
```

### 2. Ask Users to Whitelist

Add this to your app:

```typescript
// After sending reset email
<div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mt-4">
  <p className="text-sm text-yellow-800 dark:text-yellow-200">
    <strong>Não recebeu o email?</strong>
  </p>
  <ul className="text-xs text-yellow-700 dark:text-yellow-300 mt-2 space-y-1">
    <li>• Verifique sua pasta de spam</li>
    <li>• Adicione noreply@criarte.com aos contatos</li>
    <li>• Aguarde alguns minutos</li>
  </ul>
</div>
```

### 3. Add to ForgotPasswordForm

Update the success message:

```typescript
<p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
  Verifique sua caixa de entrada e <strong>pasta de spam</strong> para seguir as instruções.
  <br />
  <span className="text-xs mt-2 block">
    Dica: Adicione noreply@criarte.com aos seus contatos para receber nossos emails.
  </span>
</p>
```

---

## Testing Deliverability

### Test Checklist

- [ ] Send test email to Gmail
- [ ] Send test email to Outlook/Hotmail
- [ ] Send test email to Yahoo
- [ ] Check spam folder in all
- [ ] Verify SPF/DKIM/DMARC records
- [ ] Test with Mail Tester (score 8+)
- [ ] Check sender reputation
- [ ] Verify domain not blacklisted

---

## Recommended Approach

### For Production (Best):
1. ✅ Use SendGrid (Solution 1)
2. ✅ Set up domain authentication (Solution 2)
3. ✅ Optimize content (Solution 3)
4. ✅ Monitor with tools (Solution 5)

### For Quick Fix (Now):
1. ✅ Update email template (Solution 3)
2. ✅ Add spam folder notice (Quick Fix 3)
3. ✅ Set up DNS records (Solution 2)

---

## Cost Comparison

| Solution | Cost | Deliverability | Setup Time |
|----------|------|----------------|------------|
| Firebase Default | Free | 60-70% | 0 min |
| DNS Records | Free | 75-85% | 30 min |
| SendGrid Free | Free | 95%+ | 2 hours |
| SendGrid Pro | $15/mo | 99%+ | 2 hours |

---

## Support

If emails still go to spam after implementing these solutions:

1. Check Google Postmaster Tools
2. Verify DNS records are propagated (use DNS Checker)
3. Test with Mail Tester
4. Contact SendGrid support (if using)
5. Check Firebase Console for delivery errors

---

**Last Updated**: December 8, 2024
**Priority**: High - Affects user experience
