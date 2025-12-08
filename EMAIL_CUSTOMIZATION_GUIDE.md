# Email Customization Guide - Criarte Platform

## Overview
This guide explains how to customize email templates for password recovery and other authentication emails in the Criarte platform.

---

## Method 1: Firebase Console (Recommended for Quick Setup)

### Steps:

1. **Access Firebase Console**
   - Go to https://console.firebase.google.com
   - Select your Criarte project

2. **Navigate to Email Templates**
   - Click **Authentication** in the left sidebar
   - Click the **Templates** tab at the top
   - You'll see templates for:
     - Email address verification
     - Password reset
     - Email address change
     - SMS verification

3. **Customize Password Reset Email**
   - Click on **Password reset** template
   - Click the pencil icon to edit

4. **Available Customizations**

   **Sender Name:**
   ```
   Criarte - Sistema de Gestão Cultural
   ```

   **Subject:**
   ```
   Redefinição de Senha - Criarte
   ```

   **Email Body (Portuguese):**
   ```
   Olá,

   Recebemos uma solicitação para redefinir a senha da sua conta Criarte.

   Email: %EMAIL%

   Para criar uma nova senha, clique no botão abaixo:

   %LINK%

   Se você não solicitou esta alteração, ignore este email. Sua senha permanecerá inalterada.

   Este link expira em 1 hora por motivos de segurança.

   ---
   Atenciosamente,
   Equipe Criarte
   Sistema de Gestão Cultural

   Em caso de dúvidas, entre em contato conosco.
   ```

5. **Available Variables**
   - `%LINK%` - The action link (password reset, email verification, etc.)
   - `%EMAIL%` - User's email address
   - `%APP_NAME%` - Your application name (set in Firebase project settings)

6. **Save Changes**
   - Click **Save** button
   - Changes take effect immediately

---

## Method 2: Custom Email Action Handler (Advanced)

For complete control over the password reset flow, use the custom action handler page we created.

### Configuration:

1. **Set Custom Action URL in Firebase Console**
   - Go to **Authentication** → **Templates**
   - Click **Customize action URL**
   - Enter: `https://yourdomain.com/auth/action`
   - Click **Save**

2. **Custom Page Features**
   - Branded password reset page
   - Custom validation messages
   - Matches your app's design
   - Better user experience
   - Located at: `app/(public)/auth/action/page.tsx`

3. **Customization Options**
   - Edit the page at `app/(public)/auth/action/page.tsx`
   - Modify:
     - Logo and branding
     - Colors and styling
     - Messages and text
     - Validation rules
     - Success/error states

---

## Method 3: Custom Email Service (Most Advanced)

For complete email customization including HTML templates, images, and branding:

### Option A: Firebase Extensions

1. **Install Trigger Email Extension**
   ```bash
   firebase ext:install firebase/firestore-send-email
   ```

2. **Configure SMTP Settings**
   - Use your own email service (SendGrid, Mailgun, etc.)
   - Set up custom templates
   - Add images and branding

### Option B: Cloud Functions

Create a Cloud Function to send custom emails:

```typescript
// functions/src/index.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';

export const sendPasswordResetEmail = functions.auth.user().onCreate(async (user) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'your-email@gmail.com',
      pass: 'your-app-password'
    }
  });

  const mailOptions = {
    from: 'Criarte <noreply@criarte.com>',
    to: user.email,
    subject: 'Redefinição de Senha - Criarte',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            /* Your custom CSS */
          </style>
        </head>
        <body>
          <div style="max-width: 600px; margin: 0 auto;">
            <img src="your-logo-url" alt="Criarte Logo" />
            <h1>Redefinir Senha</h1>
            <p>Olá,</p>
            <p>Clique no botão abaixo para redefinir sua senha:</p>
            <a href="${resetLink}" style="background: #1d4a5d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
              Redefinir Senha
            </a>
          </div>
        </body>
      </html>
    `
  };

  await transporter.sendMail(mailOptions);
});
```

---

## Email Template Best Practices

### Content Guidelines:

1. **Clear Subject Line**
   - Keep it short and descriptive
   - Include app name for recognition
   - Example: "Redefinição de Senha - Criarte"

2. **Friendly Greeting**
   - Use "Olá" or "Prezado(a)"
   - Personalize when possible

3. **Clear Instructions**
   - Explain what the email is for
   - Provide clear next steps
   - Include expiration time

4. **Security Information**
   - Mention if user didn't request action
   - Include link expiration
   - Add contact information

5. **Professional Signature**
   - Include app/company name
   - Add support contact
   - Optional: social media links

### Design Guidelines:

1. **Branding**
   - Include logo
   - Use brand colors
   - Consistent typography

2. **Mobile-Friendly**
   - Responsive design
   - Large tap targets
   - Readable font sizes (min 14px)

3. **Accessibility**
   - High contrast text
   - Alt text for images
   - Clear call-to-action buttons

---

## Testing Email Templates

### Test in Firebase Console:

1. Go to **Authentication** → **Users**
2. Click **Add user** to create a test account
3. Use the **Password reset** option
4. Check the email received

### Test Custom Action Handler:

1. Request password reset from your app
2. Click the link in the email
3. Verify the custom page loads correctly
4. Test the password reset flow

---

## Example Templates

### Minimal Template (Portuguese):
```
Olá,

Para redefinir sua senha no Criarte, clique no link abaixo:
%LINK%

Se você não solicitou isso, ignore este email.

Equipe Criarte
```

### Professional Template (Portuguese):
```
Olá,

Recebemos uma solicitação para redefinir a senha da sua conta Criarte (%EMAIL%).

Para criar uma nova senha, clique no botão abaixo. Este link é válido por 1 hora.

%LINK%

Se você não solicitou esta alteração, sua conta está segura e você pode ignorar este email.

Precisa de ajuda? Entre em contato conosco respondendo este email.

Atenciosamente,
Equipe Criarte
Sistema de Gestão Cultural
```

### Detailed Template (Portuguese):
```
Prezado(a) Usuário(a),

Recebemos uma solicitação de redefinição de senha para sua conta Criarte.

📧 Email da conta: %EMAIL%
🕐 Solicitado em: [timestamp]

Para continuar com a redefinição de senha, clique no botão abaixo:

%LINK%

⚠️ IMPORTANTE:
• Este link expira em 1 hora
• Só pode ser usado uma vez
• Se você não solicitou esta alteração, ignore este email

🔒 SEGURANÇA:
Nunca compartilhe este link com outras pessoas. A equipe Criarte nunca solicitará sua senha por email.

Precisa de ajuda?
• Email: suporte@criarte.com
• Telefone: (XX) XXXX-XXXX

---
Atenciosamente,
Equipe Criarte
Sistema de Gestão Cultural

© 2024 Criarte. Todos os direitos reservados.
```

---

## Troubleshooting

### Emails Not Being Received:

1. **Check Spam Folder**
   - Emails might be filtered as spam
   - Add sender to safe list

2. **Verify Email Settings**
   - Check Firebase Console settings
   - Verify domain authentication

3. **Check Quotas**
   - Firebase has daily email limits
   - Upgrade plan if needed

### Custom Action Handler Not Working:

1. **Verify URL Configuration**
   - Check Firebase Console → Templates → Action URL
   - Ensure URL is correct and accessible

2. **Check Page Route**
   - Verify file exists at `app/(public)/auth/action/page.tsx`
   - Test URL directly in browser

3. **Review Console Errors**
   - Check browser console for errors
   - Verify Firebase configuration

---

## Next Steps

1. **Choose Your Method**
   - Quick setup: Use Firebase Console
   - Custom branding: Use custom action handler
   - Full control: Implement custom email service

2. **Test Thoroughly**
   - Test with multiple email providers
   - Verify mobile display
   - Check spam filters

3. **Monitor Performance**
   - Track email delivery rates
   - Monitor user feedback
   - Check admin logs for recovery attempts

---

**Last Updated**: December 8, 2024
**Maintained By**: Development Team
