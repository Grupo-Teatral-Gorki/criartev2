// Types for the logging system
import { FieldValue } from 'firebase/firestore';

export interface LogEntry {
  action: string;
  timestamp: Date;
  filename?: string;
  metadata?: Record<string, any>;
}

export interface UserLog {
  user: string; // user email
  logs: LogEntry[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserLogWithId extends UserLog {
  id: string; // document ID from Firestore
}

export type ActionType = 
  | 'clique_botao'
  | 'tentativa_upload'
  | 'upload_sucesso'
  | 'upload_falha'
  | 'navegacao'
  | 'login'
  | 'logout'
  | 'tentativa_login'
  | 'login_falha'
  | 'registro_usuario'
  | 'registro_falha'
  | 'envio_formulario'
  | 'abrir_modal'
  | 'fechar_modal'
  | 'busca'
  | 'download'
  | 'excluir'
  | 'editar'
  | 'visualizar'
  | 'criar_projeto'
  | 'enviar_projeto'
  | 'atualizar_projeto'
  | 'selecionar_tipo_projeto'
  | 'envio_email';
