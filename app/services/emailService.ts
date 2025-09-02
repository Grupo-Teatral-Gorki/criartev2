"use client";

interface EmailData {
  to: string;
  subject: string;
  html: string;
  projectTitle?: string;
  projectType?: string;
  userName?: string;
}

class EmailService {
  private static instance: EmailService;
  private apiEndpoint = '/api/send-email';

  private constructor() {}

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  // Send email when project is created
  public async sendProjectCreatedEmail(
    userEmail: string,
    userName: string,
    projectTitle: string,
    projectType: string
  ): Promise<boolean> {
    try {
      const emailData: EmailData = {
        to: userEmail,
        subject: `Projeto "${projectTitle}" criado com sucesso - Criarte`,
        html: this.getProjectCreatedTemplate(userName, projectTitle, projectType),
        projectTitle,
        projectType,
        userName
      };

      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      if (!response.ok) {
        throw new Error(`Email API responded with status: ${response.status}`);
      }

      console.log('Project created email sent successfully');
      return true;
    } catch (error) {
      console.error('Error sending project created email:', error);
      return false;
    }
  }

  // Send email when project is submitted
  public async sendProjectSubmittedEmail(
    userEmail: string,
    userName: string,
    projectTitle: string,
    projectType: string,
    submissionDate: Date
  ): Promise<boolean> {
    try {
      const emailData: EmailData = {
        to: userEmail,
        subject: `Projeto "${projectTitle}" enviado com sucesso - Criarte`,
        html: this.getProjectSubmittedTemplate(userName, projectTitle, projectType, submissionDate),
        projectTitle,
        projectType,
        userName
      };

      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      if (!response.ok) {
        throw new Error(`Email API responded with status: ${response.status}`);
      }

      console.log('Project submitted email sent successfully');
      return true;
    } catch (error) {
      console.error('Error sending project submitted email:', error);
      return false;
    }
  }

  // Email template for project creation
  private getProjectCreatedTemplate(
    userName: string,
    projectTitle: string,
    projectType: string
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1d4a5d, #2563eb); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #f7a251; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Projeto Criado com Sucesso!</h1>
          </div>
          <div class="content">
            <p>Olá, <strong>${userName}</strong>!</p>
            
            <p>Seu projeto foi criado com sucesso na plataforma Criarte:</p>
            
            <ul>
              <li><strong>Nome do Projeto:</strong> ${projectTitle}</li>
              <li><strong>Tipo:</strong> ${this.getProjectTypeDisplayName(projectType)}</li>
              <li><strong>Status:</strong> Em desenvolvimento</li>
            </ul>
            
            <p>Agora você pode continuar editando seu projeto e adicionar todas as informações necessárias.</p>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/meusprojetos" class="button">
              Ver Meus Projetos
            </a>
            
            <p><strong>Próximos passos:</strong></p>
            <ol>
              <li>Complete todas as seções do seu projeto</li>
              <li>Adicione um proponente</li>
              <li>Revise todas as informações</li>
              <li>Envie seu projeto para análise</li>
            </ol>
            
            <p>Se precisar de ajuda, nossa equipe está à disposição!</p>
          </div>
          <div class="footer">
            <p>© 2025 Criarte - Plataforma de Fomento Cultural</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Email template for project submission
  private getProjectSubmittedTemplate(
    userName: string,
    projectTitle: string,
    projectType: string,
    submissionDate: Date
  ): string {
    const formattedDate = submissionDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #16a34a, #22c55e); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #f7a251; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .success-box { background: #dcfce7; border: 1px solid #22c55e; padding: 20px; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Projeto Enviado com Sucesso!</h1>
          </div>
          <div class="content">
            <p>Olá, <strong>${userName}</strong>!</p>
            
            <div class="success-box">
              <p><strong>Seu projeto foi enviado com sucesso para análise!</strong></p>
            </div>
            
            <p><strong>Detalhes do envio:</strong></p>
            <ul>
              <li><strong>Nome do Projeto:</strong> ${projectTitle}</li>
              <li><strong>Tipo:</strong> ${this.getProjectTypeDisplayName(projectType)}</li>
              <li><strong>Data de Envio:</strong> ${formattedDate}</li>
              <li><strong>Status:</strong> Enviado para análise</li>
            </ul>
            
            <p><strong>O que acontece agora?</strong></p>
            <ol>
              <li>Nossa equipe irá analisar seu projeto</li>
              <li>Você receberá atualizações por email sobre o status</li>
              <li>O processo de análise pode levar alguns dias úteis</li>
              <li>Você pode acompanhar o status na plataforma</li>
            </ol>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/meusprojetos" class="button">
              Acompanhar Status
            </a>
            
            <p>Obrigado por usar a plataforma Criarte! Desejamos sucesso em seu projeto cultural.</p>
          </div>
          <div class="footer">
            <p>© 2025 Criarte - Plataforma de Fomento Cultural</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getProjectTypeDisplayName(type: string): string {
    const typeMap: Record<string, string> = {
      'fomento': 'Fomento Cultural',
      'premiacao': 'Premiação',
      'culturaViva': 'Cultura Viva',
      'areasPerifericas': 'Áreas Periféricas',
      'subsidio': 'Subsídio'
    };
    return typeMap[type] || type;
  }
}

export default EmailService;
