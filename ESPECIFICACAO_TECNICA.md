# Especificação Técnica - CriArte v2

## 1. Visão Geral da Plataforma

**CriArte v2** é uma plataforma web para gestão de projetos culturais municipais, com foco em cadastro de proponentes, submissão de projetos, avaliação e administração de editais culturais. A plataforma é multi-município, permitindo que diferentes cidades configurem seus próprios processos seletivos.

### Propósito Principal
- Cadastro e gestão de proponentes culturais (pessoa física, jurídica e coletivos)
- Submissão de projetos culturais vinculados a editais municipais
- Avaliação e acompanhamento de projetos por revisores e administradores
- Geração de relatórios e estatísticas de mapeamento cultural

---

## 2. Stack Tecnológico

### 2.1 Framework e Runtime
| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **Next.js** | 15.5.12 | Framework full-stack React com App Router |
| **React** | 19.0.0 | Biblioteca de UI declarativa |
| **TypeScript** | 5.x | Tipagem estática e desenvolvimento seguro |
| **Node.js** | 20+ | Runtime do servidor (implícito pelo Next.js) |

### 2.2 Estilização e UI
| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **Tailwind CSS** | 3.4.1 | Framework utilitário CSS |
| **Lucide React** | 0.475.0 | Ícones modernos e acessíveis |
| **React Spinners** | 0.16.1 | Indicadores de carregamento animados |

### 2.3 Backend e Banco de Dados
| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **Firebase** | 11.6.0 | Suite de serviços do Google (Auth, Firestore, Storage) |
| **Firebase Admin** | 13.4.0 | SDK administrativo para operações server-side |

### 2.4 Armazenamento de Arquivos
| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **AWS SDK S3** | 3.758.0 | Cliente para armazenamento S3 |
| **AWS S3 Presigned Post** | 3.758.0 | Uploads seguros via POST assinado |
| **Firebase Storage** | 11.6.0 | Storage de objetos integrado ao Firebase |
| **JSZip** | 3.10.1 | Compressão e manipulação de arquivos ZIP |

### 2.5 Manipulação de Documentos
| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **pdf-lib** | 1.17.1 | Criação e manipulação de PDFs no browser |
| **file-saver** | 2.0.5 | Download de arquivos no cliente |

### 2.6 Comunicação e E-mail
| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **Resend** | 6.0.2 | Serviço de envio de e-mails transacionais |
| **Nodemailer** | 8.0.1 | Envio de e-mails via SMTP |
| **SendGrid** | 8.1.5 | Alternativa para envio de e-mails |

### 2.7 Formulários e Validação
| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **React Hook Form** | 7.62.0 | Gerenciamento de estado de formulários |
| **Yup** | 1.6.1 | Validação de schemas (via @hookform/resolvers) |
| **Zod** | 3.25.76 | Validação de schemas TypeScript-first |

### 2.8 Segurança
| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **isomorphic-dompurify** | 2.26.0 | Sanitização de HTML para prevenir XSS |
| **nanoid** | 5.1.3 | Geração de IDs únicos e seguros |
| **cookies-next** | 5.1.0 | Manipulação de cookies no Next.js |

### 2.9 Renderização de Conteúdo
| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **React Markdown** | 10.1.0 | Renderização de Markdown para React |
| **Remark GFM** | 4.0.1 | Suporte a GitHub Flavored Markdown |

### 2.10 Testes
| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **Jest** | 30.2.0 | Framework de testes unitários |
| **Testing Library React** | 16.3.0 | Utilitários para testes de componentes React |
| **Testing Library Jest DOM** | 6.9.1 | Matchers customizados para DOM |
| **Testing Library User Event** | 14.6.1 | Simulação de interações do usuário |

---

## 3. Arquitetura do Sistema

### 3.1 Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTE                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐ │
│  │   Next.js    │  │  Tailwind    │  │  Firebase SDK    │ │
│  │   (React)    │  │    CSS       │  │   (Browser)      │ │
│  └──────────────┘  └──────────────┘  └──────────────────┘ │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS / WebSocket
┌────────────────────────┴────────────────────────────────────┐
│                     NEXT.JS SERVER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  App Router  │  │  API Routes  │  │   Middlewares    │  │
│  │   (RSC/RC)   │  │  (/api/*)    │  │  (Segurança)     │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
┌────────┴──────┐ ┌──────┴────────┐ ┌────┴──────────────────┐
│   Firebase    │ │    AWS S3     │ │      Resend API       │
│   Auth        │ │   (Storage)   │ │     (E-mail)          │
│   Firestore   │ │               │ │                       │
│   Storage     │ │               │ │                       │
└───────────────┘ └───────────────┘ └───────────────────────┘
```

### 3.2 Padrão de Renderização
- **Server Components (RSC)**: Usados para páginas estáticas e busca de dados iniciais
- **Client Components ("use client")**: Usados para interatividade, formulários, autenticação e stateful UI
- **Streaming**: Next.js 15 com suporte a streaming de componentes

### 3.3 Estrutura de Diretórios (App Router)

```
app/
├── (home)/                    # Grupo de rotas - página de login/registro
│   └── page.tsx
├── (main)/                    # Grupo de rotas - área logada
│   ├── layout.tsx             # Layout principal com Header/Footer
│   ├── (admin)/               # Área administrativa
│   │   └── admin/
│   │       ├── page.tsx       # Dashboard admin
│   │       ├── city-config/   # Configuração de cidades e projetos
│   │       ├── review/        # Avaliação de projetos
│   │       ├── review-config/ # Configuração de avaliadores
│   │       ├── users/         # Gerenciamento de usuários
│   │       ├── logs/          # Logs de auditoria
│   │       └── feedback/      # Feedback dos usuários
│   ├── criar/                 # Fluxo de criação de projetos
│   │   ├── page.tsx           # Página principal do formulário
│   │   └── secoes/            # Seções do formulário
│   │       ├── InfoGerais.tsx
│   │       ├── Documentos.tsx
│   │       ├── FichaTecnica.tsx
│   │       ├── PlanilhaOrcamentaria.tsx
│   │       └── Proponente.tsx
│   ├── meusprojetos/          # Listagem de projetos do usuário
│   ├── proponentes/           # Cadastro de proponentes
│   │   ├── novo/
│   │   │   ├── fisica/
│   │   │   ├── juridica/
│   │   │   └── coletivo/
│   │   └── consts/            # Definições de formulários
│   ├── profile/               # Perfil do usuário
│   ├── selecionar-tipo/       # Seleção de tipo de projeto
│   ├── habilitacao/           # Habilitação de proponentes
│   ├── recurso/               # Recursos administrativos
│   ├── help/                  # Central de ajuda
│   ├── management/            # Gestão de mapeamento cultural
│   └── map/                   # Mapeamento geográfico cultural
├── (public)/                  # Rotas públicas (sem autenticação)
│   └── estatisticas/
├── api/                       # API Routes do Next.js
│   ├── auth/
│   ├── email/
│   ├── presigned-url/
│   └── upload/
├── components/                # Componentes reutilizáveis
│   ├── Button.tsx
│   ├── TextInput.tsx
│   ├── SelectInput.tsx
│   ├── Toast.tsx
│   ├── Modal.tsx
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── ...
├── context/                   # Contextos React
│   └── AuthContext.tsx
├── hooks/                     # Custom Hooks
│   ├── useSecureAuth.ts
│   └── ...
├── services/                  # Serviços de negócio
│   ├── proponenteService.ts
│   ├── loggingService.ts
│   ├── emailService.ts
│   ├── securityService.ts
│   └── ...
├── utils/                     # Utilitários e interfaces
│   ├── interfaces.ts
│   └── ...
├── config/                    # Configurações
│   └── firebaseconfig.ts
└── types/                     # Tipos globais
    └── logging.ts
```

---

## 4. Sistema de Autenticação e Autorização

### 4.1 Autenticação
- **Provedor**: Firebase Authentication
- **Métodos**: E-mail/senha
- **Persistência**: `browserLocalPersistence` (mantém sessão entre reinicializações)
- **Contexto**: `AuthContext` fornece `user` (Firebase User) e `dbUser` (dados do Firestore)

### 4.2 Papéis de Usuário (`userRole`)
O sistema utiliza um array de strings para definir permissões:

| Papel | Permissões |
|-------|-----------|
| `admin` / `administrador` | Acesso total ao painel administrativo |
| `user` | Criar projetos, submeter propostas, gerenciar proponentes |
| `reviewer` | Avaliar projetos designados |

### 4.3 RBAC (Role-Based Access Control)
Implementado via hook `useSecureAuth`:

```typescript
const permissions = {
  'admin': ['admin', 'administrador'],
  'create_project': ['admin', 'administrador', 'user'],
  'view_logs': ['admin', 'administrador'],
  'manage_users': ['admin', 'administrador'],
  'upload_files': ['admin', 'administrador', 'user'],
  'view_reports': ['admin', 'administrador']
};
```

### 4.4 Session Timeout
- **Duração**: 30 minutos de inatividade
- **Monitoramento**: Eventos de interação (`mousedown`, `mousemove`, `keypress`, `scroll`, `touchstart`, `click`)
- **Verificação**: A cada 60 segundos via `setInterval`

### 4.5 Middleware de Segurança (`middlewares.ts`)
- **Rate Limiting**: 100 requisições por IP a cada 15 minutos
- **Detecção de XSS/SQL Injection**: Padrões regex para scripts, union selects, path traversal
- **Headers de Segurança**:
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Content-Security-Policy` (CSP) completo
  - `Referrer-Policy: strict-origin-when-cross-origin`
- **Redirecionamento**: Usuários não autenticados são redirecionados para `/`

---

## 5. Modelo de Dados (Firebase Firestore)

### 5.1 Coleções Principais

#### `users`
```typescript
interface UserProfile {
  id: string;                    // UID do Firebase Auth
  cityId: string;                // ID da cidade vinculada
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  userType: number;
  userRole: string[];           // ["admin", "user", ...]
  photoUrl: string;
  dataPolicyAccepted?: boolean;
  dataPolicyAcceptedAt?: string | Date;
  dataPolicyVersion?: string;
  createdAt: string;
}
```

#### `cities`
```typescript
interface City {
  id: string;
  name: string;
  uf: string;
  cityId: string;               // Código IBGE
  cityLogoUrl?: string;
  typesOfProjects?: Project[];
  processStage?: string;
  enforceUniqueFichaTecnicaCpf?: boolean;
}
```

#### `projects` (dentro da cidade)
```typescript
interface Project {
  name: string;                 // Chave interna (slug)
  label: string;                // Nome exibido
  description: string;
  available: boolean;           // Ativo/inativo
  acceptedProponentTypes: ProponenteTipo[];
  fields: Record<string, FieldItem[]>;  // Campos por seção
  extraGeneralInfo?: boolean;
  extraFields?: ExtraFieldsConfig;      // Campos extras configuráveis
}
```

#### `proponentes`
```typescript
interface ProponenteData {
  id?: string;
  tipo: 'fisica' | 'juridica' | 'coletivo';
  userId: string;
  userEmail: string;
  cityId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  // Dados específicos do tipo de proponente
  dadosPessoais?: { ... };
  contato?: { ... };
  endereco?: { ... };
  perfilDoResponsavel?: {
    informacoesDemograficas: { ... };
    experiencia: { ... };
    aspectosFinanceiros: { ... };
    objetivos: { ... };
  };
}
```

#### `userProjects` / Submissões
Cada projeto submetido contém:
- `generalInfo`: Informações gerais preenchidas pelo formulário dinâmico
- `fichaTecnica`: Equipe do projeto (nome, cargo, CPF)
- `planilhaOrcamentaria`: Itens orçamentários
- `projectDocs`: Documentos anexos
- `status`: `"rascunho"`, `"enviado"`, `"avaliado"`, etc.
- `reviewer`: UID do avaliador designado
- `evaluated`: boolean

#### `logs`
Sistema de auditoria com:
- Ações do usuário (login, logout, criação, atualização)
- Uploads de arquivos
- Eventos de segurança
- Envio de e-mails

### 5.2 Relacionamentos
```
City (1) ----> (*) Project
City (1) ----> (*) Proponente
User (1) ----> (*) Proponente
User (1) ----> (*) UserProject
Project (1) --> (*) UserProject (submissions)
User (1) ----> (*) LogEntry
```

---

## 6. Funcionalidades Principais

### 6.1 Autenticação e Perfil
| Funcionalidade | Descrição |
|---------------|-----------|
| Login/Registro | E-mail/senha via Firebase Auth |
| Recuperação de Senha | Envio de e-mail com link de redefinição |
| Perfil de Usuário | Edição de dados pessoais, foto, cidade |
| Aceite de Política de Dados | Controle de versão e aceite de política |
| Alteração de Cidade | Usuário pode trocar de município |

### 6.2 Cadastro de Proponentes (Multi-tipo)
| Tipo | Seções Principais |
|------|------------------|
| **Pessoa Física** | Dados pessoais, contato, endereço, perfil demográfico, experiência, aspectos financeiros, objetivos |
| **Pessoa Jurígica** | Dados da PJ, contato, responsável legal, endereço da PJ, perfil da PJ, experiências/parcerias, impacto social, perfil do responsável |
| **Coletivo** | Dados do coletivo, contato, responsável legal, endereço do coletivo, perfil do responsável, financeiro e objetivos |

**Características dos formulários:**
- Multi-etapas (wizard) com validação por step
- Campos condicionais (ex: área de conhecimento só aparece para graduação+)
- Compressão automática de imagens e PDFs
- Limite de upload: **10MB**

### 6.3 Criação de Projetos
| Seção | Conteúdo |
|-------|----------|
| **Informações Gerais** | Campos dinâmicos baseados na configuração da cidade |
| **Ficha Técnica** | Membros da equipe (nome, cargo, CPF) |
| **Planilha Orçamentária** | Itens com valor unitário, quantidade, total |
| **Documentos** | Upload de arquivos (PNG, JPG, WEBP, PDF) |
| **Proponente** | Seleção de proponente cadastrado |

**Recursos avançados:**
- Campos extras configuráveis por cidade (Eixo, Módulo, Categoria)
- Validação de CPF único na ficha técnica (opcional por cidade)
- Salvamento automático em rascunho

### 6.4 Administração
| Funcionalidade | Descrição |
|---------------|-----------|
| **Configuração de Cidades** | Cadastro de novos municípios com logo, UF, tipos de projetos |
| **Edição de Projetos** | CRUD de tipos de projetos, drag-and-drop de campos, configuração de seções |
| **Configuração de Avaliação** | Critérios de avaliação por nota (0-10) |
| **Atribuição de Avaliadores** | Designar revisores a projetos submetidos |
| **Gestão de Usuários** | Visualização e gerenciamento de permissões |
| **Logs e Auditoria** | Registro de todas as ações administrativas |
| **Feedback** | Sistema de coleta de feedback dos usuários |

### 6.5 Avaliação de Projetos
- Revisores acessam projetos designados
- Critérios de avaliação configuráveis
- Sistema de notas (0-10) com média automática
- Texto técnico opcional
- Status: `enviado` -> `avaliado`

### 6.6 Mapeamento Cultural
- Dashboard de estatísticas por cidade
- Filtros por zona, bairro, gênero, raça, área de atuação
- Exportação de dados
- Mapa geográfico de proponentes

---

## 7. Fluxos de Dados

### 7.1 Fluxo de Submissão de Projeto
```
1. Usuário seleciona tipo de projeto
2. Sistema carrega configuração dinâmica da cidade
3. Usuário preenche formulário multi-etapas
4. Validação em tempo real (campos obrigatórios, tipos)
5. Upload de documentos (compressão se necessário)
6. Salvamento automático em rascunho (Firestore)
7. Ao finalizar, status muda para "enviado"
8. Sistema notifica administradores (e-mail)
9. Administrador designa avaliador
10. Avaliador avalia e salva notas
11. Sistema calcula média e atualiza status
```

### 7.2 Fluxo de Cadastro de Proponente
```
1. Usuário escolhe tipo (física/jurídica/coletivo)
2. Sistema carrega definição de formulário específica
3. Wizard multi-steps (5-7 etapas)
4. Validação por etapa com feedback visual
5. Dados salvos na coleção "proponentes"
6. Vinculação automática ao userId e cityId
```

### 7.3 Fluxo de Upload de Arquivos
```
1. Usuário seleciona arquivo (drag-and-drop ou click)
2. Validação de tipo (PNG, JPG, WEBP, PDF)
3. Validação de tamanho (máx. 10MB)
4. Se imagem > limite: compressão automática (canvas)
5. Se PDF > limite: compressão via pdf-lib
6. Upload para Firebase Storage
7. URL salva no documento do projeto
8. Log de upload gerado
```

---

## 8. Componentes Principais

### 8.1 Componentes de UI (Reutilizáveis)
| Componente | Props Principais | Descrição |
|-----------|-------------------|-----------|
| `Button` | `label`, `onClick`, `variant`, `disabled` | Botão estilizado com variantes (filled, outlined) |
| `TextInput` | `name`, `label`, `value`, `onChange`, `required` | Input de texto com label flutuante |
| `SelectInput` | `name`, `label`, `options`, `value` | Dropdown com opções configuráveis |
| `MaskedInput` | `name`, `mask`, `placeholder` | Input com máscara (CPF, CEP, telefone) |
| `Toast` | `message`, `type`, `visible` | Notificação temporária |
| `Modal` | `isOpen`, `onClose`, `title` | Modal overlay |
| `EvaluationTable` | `headers`, `rows`, `onScoresUpdate` | Tabela de avaliação com inputs de nota |

### 8.2 Componentes de Página
| Componente | Descrição |
|-----------|-----------|
| `Header` | Navegação principal, seletor de cidade, menu mobile |
| `Footer` | Informações de contato e logo |
| `RenderProject` | Renderização de informações gerais do projeto |
| `RenderEvaluationForm` | Formulário de avaliação com critérios |
| `EvaluateProjectClient` | Página completa de avaliação com tabs |
| `CardLink` | Card de navegação para funcionalidades admin |

---

## 9. Serviços de Backend

### 9.1 ProponenteService
- **Padrão**: Singleton
- **Métodos**:
  - `createProponente(data)`: Cria novo proponente
  - `getProponentesByUser(userId)`: Lista proponentes do usuário
  - `getProponentesByCity(cityId)`: Lista proponentes da cidade
  - `updateProponente(id, data)`: Atualiza proponente
  - `deleteProponente(id)`: Remove proponente
  - `getCityStatistics(cityId)`: Estatísticas agregadas

### 9.2 LoggingService
- **Padrão**: Singleton
- **Funcionalidades**:
  - Registro de login/logout
  - Registro de uploads de arquivos
  - Registro de criação/atualização de projetos
  - Envio de e-mails de notificação (throttle: 30 minutos)
  - Log de eventos de segurança

### 9.3 EmailService
- **Padrão**: Singleton
- **Provedores**: Resend, Nodemailer, SendGrid
- **Funcionalidades**:
  - Envio de e-mails transacionais
  - Notificações de status de projeto
  - Alertas de segurança para administradores
  - Templates de e-mail

### 9.4 SecurityService
- **Padrão**: Singleton
- **Funcionalidades**:
  - Validação de tipos de arquivo
  - Validação de tamanho de arquivo
  - Sanitização de inputs
  - Verificação de extensões permitidas

### 9.5 SecurityMonitoringService
- **Funcionalidades**:
  - Registro de eventos de segurança
  - Monitoramento de uploads suspeitos
  - Alertas de atividade anômala

---

## 10. Configuração de Ambiente

### 10.1 Variáveis de Ambiente
```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# AWS S3 (para uploads de arquivos grandes)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_BUCKET_NAME=

# E-mail (Resend)
RESEND_API_KEY=

# Debug
NEXT_PUBLIC_LOGGING_DEBUG=true/false
```

### 10.2 Regras do Firestore
- Definidas em `firestore.rules`
- Controle de acesso baseado em autenticação
- Restrições por `userId` e `cityId`

---

## 11. Segurança

### 11.1 Medidas Implementadas
- **CSP (Content Security Policy)**: Headers restritos para prevenir XSS
- **Rate Limiting**: 100 req/15min por IP
- **Sanitização de Inputs**: DOMPurify para conteúdo HTML
- **Validação de Arquivos**: Tipos e tamanhos validados no cliente e servidor
- **Session Timeout**: 30 minutos de inatividade
- **CSP Reporting**: Política de segurança de conteúdo configurada
- **Anti-Clickjacking**: `X-Frame-Options: DENY`

### 11.2 Compressão de Arquivos
- **Imagens**: Redimensionamento para 1920x1920 máximo, compressão via canvas
- **PDFs**: Compressão via pdf-lib
- **Limite**: 10MB após compressão

---

## 12. Performance

### 12.1 Otimizações
- **Code Splitting**: Webpack config para chunks vendor/common
- **Image Optimization**: Redimensionamento automático
- **Lazy Loading**: Componentes carregados sob demanda
- **Static Generation**: Páginas públicas pré-renderizadas
- **Timeout Config**: WebSocket 2 minutos, static generation 180s

### 12.2 Build
```bash
npm run build    # Build de produção
npm run start    # Servidor de produção
npm run dev      # Servidor de desenvolvimento
```

---

## 13. Dependências e Versões

Ver `package.json` para lista completa. Principais:
- **Runtime**: Node.js 20+
- **Framework**: Next.js 15.5.12
- **React**: 19.0.0
- **TypeScript**: 5.x
- **Tailwind**: 3.4.1
- **Firebase**: 11.6.0

---

## 14. Manutenção e Evolução

### 14.1 Pontos de Extensão
- **Campos Dinâmicos**: Novos tipos de campos podem ser adicionados em `EditCityProjects.tsx`
- **Novos Tipos de Proponente**: Adicionar const no diretório `proponentes/consts/`
- **Novas Cidades**: Cadastro via painel admin com logo e configurações
- **Novas Seções de Projeto**: Configuráveis no admin por cidade

### 14.2 Próximos Passos Sugeridos
- Implementar cache com React Query/SWR
- Adicionar testes E2E com Playwright
- Implementar PWA para acesso offline
- Adicionar internacionalização (i18n)
- Migrar para Server Actions para operações críticas

---

*Documento gerado em: Junho de 2026*
*Versão da plataforma: 0.1.0*
