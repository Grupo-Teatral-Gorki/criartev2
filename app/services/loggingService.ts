"use client";
import { db } from '../config/firebaseconfig';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  arrayUnion, 
  serverTimestamp, 
  getDocs, 
  query, 
  orderBy, 
  where 
} from 'firebase/firestore';
import { LogEntry, UserLog, UserLogWithId, ActionType } from '../types/logging';

class LoggingService {
  private static instance: LoggingService;
  private currentUser: string | null = null;

  private constructor() {}

  public static getInstance(): LoggingService {
    if (!LoggingService.instance) {
      LoggingService.instance = new LoggingService();
    }
    return LoggingService.instance;
  }

  public setCurrentUser(userEmail: string) {
    this.currentUser = userEmail;
    console.log(`LoggingService: Current user set to: ${userEmail}`);
  }

  public getCurrentUser(): string | null {
    return this.currentUser;
  }

  public async logAction(
    action: ActionType,
    metadata?: Record<string, any>,
    filename?: string
  ): Promise<void> {
    if (!this.currentUser) {
      console.warn('LoggingService: No user set, cannot log action');
      return;
    }

    console.log(`LoggingService: Attempting to log action "${action}" for user: ${this.currentUser}`);

    try {
      // ✅ Use Date instead of serverTimestamp inside arrayUnion
      const logEntry = {
        action,
        createdAt: new Date(),
        ...(filename && { filename }),
        ...(metadata && { metadata })
      };

      const userLogRef = doc(db, 'logs', this.currentUser);
      const userLogDoc = await getDoc(userLogRef);

      if (userLogDoc.exists()) {
        // Update existing document
        await updateDoc(userLogRef, {
          logs: arrayUnion(logEntry),
          updatedAt: serverTimestamp()
        });
      } else {
        // Create new document
        const newUserLog = {
          user: this.currentUser,
          logs: [logEntry],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        await setDoc(userLogRef, newUserLog);
      }

      console.log(`Successfully logged action: ${action} for user: ${this.currentUser}`);
    } catch (error: any) {
      console.error(`Error logging action "${action}" for user ${this.currentUser}:`, error);
      console.error('Error details:', {
        errorCode: error?.code,
        errorMessage: error?.message,
        user: this.currentUser,
        action: action
      });
    }
  }

  // Convenience methods for common actions
  public async logButtonClick(buttonName: string, metadata?: Record<string, any>): Promise<void> {
    await this.logAction('clique_botao', { buttonName, ...metadata });
  }

  public async logFileUploadAttempt(filename: string, metadata?: Record<string, any>): Promise<void> {
    await this.logAction('tentativa_upload', metadata, filename);
  }

  public async logFileUploadSuccess(filename: string, metadata?: Record<string, any>): Promise<void> {
    await this.logAction('upload_sucesso', metadata, filename);
  }

  public async logFileUploadFailure(filename: string, error: string, metadata?: Record<string, any>): Promise<void> {
    await this.logAction('upload_falha', { error, ...metadata }, filename);
  }

  public async logNavigation(from: string, to: string, metadata?: Record<string, any>): Promise<void> {
    await this.logAction('navegacao', { from, to, ...metadata });
  }

  public async logLogin(metadata?: Record<string, any>): Promise<void> {
    await this.logAction('login', metadata);
  }

  public async logLogout(metadata?: Record<string, any>): Promise<void> {
    await this.logAction('logout', metadata);
  }

  public async logFormSubmit(formName: string, metadata?: Record<string, any>): Promise<void> {
    await this.logAction('envio_formulario', { formName, ...metadata });
  }

  public async logModalOpen(modalName: string, metadata?: Record<string, any>): Promise<void> {
    await this.logAction('abrir_modal', { modalName, ...metadata });
  }

  public async logModalClose(modalName: string, metadata?: Record<string, any>): Promise<void> {
    await this.logAction('fechar_modal', { modalName, ...metadata });
  }

  public async logSearch(query: string, results?: number, metadata?: Record<string, any>): Promise<void> {
    await this.logAction('busca', { query, results, ...metadata });
  }

  public async logDownload(filename: string, metadata?: Record<string, any>): Promise<void> {
    await this.logAction('download', metadata, filename);
  }

  public async logDelete(itemType: string, itemId: string, metadata?: Record<string, any>): Promise<void> {
    await this.logAction('excluir', { itemType, itemId, ...metadata });
  }

  public async logEdit(itemType: string, itemId: string, metadata?: Record<string, any>): Promise<void> {
    await this.logAction('editar', { itemType, itemId, ...metadata });
  }

  public async logView(itemType: string, itemId: string, metadata?: Record<string, any>): Promise<void> {
    await this.logAction('visualizar', { itemType, itemId, ...metadata });
  }

  // Project-specific logging methods
  public async logProjectCreation(projectId: string, projectType: string, metadata?: Record<string, any>): Promise<void> {
    await this.logAction('criar_projeto', { projectId, projectType, ...metadata });
  }

  public async logProjectSubmission(projectId: string, projectTitle?: string, metadata?: Record<string, any>): Promise<void> {
    await this.logAction('enviar_projeto', { projectId, projectTitle, ...metadata });
  }

  public async logProjectUpdate(projectId: string, updateType: string, metadata?: Record<string, any>): Promise<void> {
    await this.logAction('atualizar_projeto', { projectId, updateType, ...metadata });
  }

  public async logProjectTypeSelection(projectType: string, metadata?: Record<string, any>): Promise<void> {
    await this.logAction('selecionar_tipo_projeto', { projectType, ...metadata });
  }

  // Admin-only methods for reading logs
  public async getAllUserLogs(): Promise<UserLogWithId[]> {
    try {
      const logsCollection = collection(db, 'logs');
      const logsQuery = query(logsCollection, orderBy('updatedAt', 'desc'));
      const querySnapshot = await getDocs(logsQuery);
      
      const allLogs: UserLogWithId[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as UserLog;
        // ✅ sort logs array by createdAt before pushing (latest first)
        const sortedLogs = (data.logs || []).sort(
          (a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
        );
        allLogs.push({ id: doc.id, ...data, logs: sortedLogs });
      });
      
      return allLogs;
    } catch (error) {
      console.error('Error fetching all user logs:', error);
      throw error;
    }
  }

  public async getUserLogs(userEmail: string): Promise<UserLogWithId | null> {
    try {
      const userLogRef = doc(db, 'logs', userEmail);
      const userLogDoc = await getDoc(userLogRef);
      
      if (userLogDoc.exists()) {
        const data = userLogDoc.data() as UserLog;
        const sortedLogs = (data.logs || []).sort(
          (a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
        );
        return { id: userLogDoc.id, ...data, logs: sortedLogs };
      }
      
      return null;
    } catch (error) {
      console.error(`Error fetching logs for user ${userEmail}:`, error);
      throw error;
    }
  }

  public async isUserAdmin(userEmail: string): Promise<boolean> {
    try {
      // Query users collection to find user by email since documents are stored by UID
      const usersCollection = collection(db, 'users');
      const q = query(usersCollection, where('email', '==', userEmail));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        const userRole = userData.userRole || [];
        console.log(`Admin check for ${userEmail}:`, { userRole, isAdmin: userRole.includes('admin') || userRole.includes('administrador') });
        return userRole.includes('admin') || userRole.includes('administrador');
      }
      
      console.log(`No user found with email: ${userEmail}`);
      return false;
    } catch (error) {
      console.error(`Error checking admin status for user ${userEmail}:`, error);
      return false;
    }
  }
}

export default LoggingService;
