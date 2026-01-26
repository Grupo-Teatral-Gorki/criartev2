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
    console.log(`[EMAIL] Triggering PROJECT CREATED email to: ${userEmail}, project: ${projectTitle}`);
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

      console.log(`[EMAIL] SUCCESS - Project created email sent to: ${userEmail}`);
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
    console.log(`[EMAIL] Triggering PROJECT SUBMITTED email to: ${userEmail}, project: ${projectTitle}`);
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

      console.log(`[EMAIL] SUCCESS - Project submitted email sent to: ${userEmail}`);
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
            <p>© ${new Date().getFullYear()} Criarte - Plataforma de Fomento Cultural</p>
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
            <p>© ${new Date().getFullYear()} Criarte - Plataforma de Fomento Cultural</p>
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

  private getStageDisplayName(stage: string): string {
    const stageMap: Record<string, string> = {
      'open': 'Inscrições Abertas',
      'closed': 'Inscrições Fechadas',
      'habilitacao': 'Habilitação',
      'recurso': 'Recurso'
    };
    return stageMap[stage] || stage;
  }

  // Send email when city process stage changes
  public async sendStageChangeEmail(
    userEmail: string,
    cityName: string,
    newStage: string
  ): Promise<boolean> {
    console.log(`[EMAIL] Triggering STAGE CHANGE email to: ${userEmail}, city: ${cityName}, stage: ${newStage}`);
    try {
      const stageDisplayName = this.getStageDisplayName(newStage);
      
      const emailData: EmailData = {
        to: userEmail,
        subject: `Atualização de Etapa - ${cityName} - Criarte`,
        html: this.getStageChangeTemplate(cityName, stageDisplayName),
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

      console.log(`[EMAIL] SUCCESS - Stage change email sent to: ${userEmail}`);
      return true;
    } catch (error) {
      console.error('Error sending stage change email:', error);
      return false;
    }
  }

  // Send stage change emails to multiple users
  public async sendStageChangeEmailBatch(
    userEmails: string[],
    cityName: string,
    newStage: string
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const email of userEmails) {
      const result = await this.sendStageChangeEmail(email, cityName, newStage);
      if (result) {
        success++;
      } else {
        failed++;
      }
    }

    console.log(`Stage change emails sent: ${success} success, ${failed} failed`);
    return { success, failed };
  }

  // Email template for stage change
  private getStageChangeTemplate(cityName: string, stageName: string): string {
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
          .stage-box { background: #dbeafe; border: 2px solid #2563eb; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
          .stage-name { font-size: 24px; font-weight: bold; color: #1d4a5d; }
          .button { display: inline-block; background: #f7a251; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📢 Atualização de Etapa</h1>
          </div>
          <div class="content">
            <p>Olá!</p>
            
            <p>Informamos que houve uma mudança na etapa do processo cultural em <strong>${cityName}</strong>.</p>
            
            <div class="stage-box">
              <p style="margin: 0; color: #666;">Nova etapa:</p>
              <p class="stage-name">${stageName}</p>
            </div>
            
            <p><strong>O que isso significa?</strong></p>
            <ul>
              ${this.getStageDescription(stageName)}
            </ul>
            
            <p>Acesse a plataforma para mais informações sobre o processo.</p>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/home" class="button">
              Acessar Plataforma
            </a>
            
            <p>Em caso de dúvidas, entre em contato com a secretaria de cultura do seu município.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Criarte - Plataforma de Fomento Cultural</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Send email when project is updated
  public async sendProjectUpdatedEmail(
    userEmail: string,
    userName: string,
    projectTitle: string,
    updateType: string
  ): Promise<boolean> {
    console.log(`[EMAIL] Triggering PROJECT UPDATED email to: ${userEmail}, project: ${projectTitle}, updateType: ${updateType}`);
    try {
      const emailData: EmailData = {
        to: userEmail,
        subject: `Projeto "${projectTitle}" atualizado - Criarte`,
        html: this.getProjectUpdatedTemplate(userName, projectTitle, updateType),
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

      console.log(`[EMAIL] SUCCESS - Project updated email sent to: ${userEmail}`);
      return true;
    } catch (error) {
      console.error('Error sending project updated email:', error);
      return false;
    }
  }

  // Email template for project update
  private getProjectUpdatedTemplate(
    userName: string,
    projectTitle: string,
    updateType: string
  ): string {
    const updateTypeDisplay = this.getUpdateTypeDisplayName(updateType);
    
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
          .update-box { background: #e0f2fe; border-left: 4px solid #0284c7; padding: 15px; margin: 20px 0; }
          .button { display: inline-block; background: #f7a251; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Projeto Atualizado</h1>
          </div>
          <div class="content">
            <p>Olá, <strong>${userName}</strong>!</p>
            
            <p>Seu projeto foi atualizado com sucesso na plataforma Criarte.</p>
            
            <div class="update-box">
              <p style="margin: 0;"><strong>Projeto:</strong> ${projectTitle}</p>
              <p style="margin: 5px 0 0 0;"><strong>Atualização:</strong> ${updateTypeDisplay}</p>
            </div>
            
            <p>Você pode acompanhar e continuar editando seu projeto a qualquer momento.</p>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/meusprojetos" class="button">
              Ver Meus Projetos
            </a>
            
            <p>Lembre-se de enviar seu projeto antes do prazo final!</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Criarte - Plataforma de Fomento Cultural</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getUpdateTypeDisplayName(updateType: string): string {
    const typeMap: Record<string, string> = {
      'titulo': 'Título do projeto alterado',
      'status': 'Status do projeto alterado',
      'infoGerais': 'Informações gerais atualizadas',
      'documentos': 'Documentos atualizados',
      'planilha': 'Planilha orçamentária atualizada',
      'proponente': 'Proponente atualizado',
      'cronograma': 'Cronograma atualizado',
      'equipe': 'Equipe atualizada',
      'default': 'Projeto atualizado'
    };
    return typeMap[updateType] || typeMap['default'];
  }

  private getStageDescription(stageName: string): string {
    const descriptions: Record<string, string> = {
      'Inscrições Abertas': `
        <li>O período de inscrições está aberto</li>
        <li>Você pode criar e enviar seus projetos</li>
        <li>Fique atento ao prazo de encerramento</li>
      `,
      'Inscrições Fechadas': `
        <li>O período de inscrições foi encerrado</li>
        <li>Não é mais possível enviar novos projetos</li>
        <li>Aguarde a próxima fase do processo</li>
      `,
      'Habilitação': `
        <li>Os projetos estão em fase de análise de habilitação</li>
        <li>Será verificado se os requisitos foram cumpridos</li>
        <li>Em breve você receberá o resultado</li>
      `,
      'Recurso': `
        <li>O período de recursos está aberto</li>
        <li>Caso necessário, você pode apresentar recurso</li>
        <li>Verifique o prazo para apresentação de recursos</li>
      `
    };
    return descriptions[stageName] || '<li>Verifique a plataforma para mais detalhes</li>';
  }
}

export default EmailService;
