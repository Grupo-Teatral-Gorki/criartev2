// Translation mapping for action types
export const actionTranslations: Record<string, string> = {
  'clique_botao': 'Clique em Botão',
  'tentativa_upload': 'Tentativa de Upload',
  'upload_sucesso': 'Upload Realizado',
  'upload_falha': 'Falha no Upload',
  'navegacao': 'Navegação',
  'login': 'Login Bem-Sucedido',
  'logout': 'Logout',
  'tentativa_login': 'Tentativa de Login',
  'login_falha': 'Falha no Login',
  'registro_usuario': 'Registro de Usuário',
  'registro_falha': 'Falha no Registro',
  'envio_formulario': 'Envio de Formulário',
  'abrir_modal': 'Abrir Modal',
  'fechar_modal': 'Fechar Modal',
  'busca': 'Busca',
  'download': 'Download',
  'excluir': 'Excluir',
  'editar': 'Editar',
  'visualizar': 'Visualizar',
  'criar_projeto': 'Criar Projeto',
  'enviar_projeto': 'Enviar Projeto',
  'atualizar_projeto': 'Atualizar Projeto',
  'selecionar_tipo_projeto': 'Seleção de Tipo de Projeto',
  'envio_email': 'Envio de Email'
};

export const getActionDisplayName = (action: string): string => {
  return actionTranslations[action] || action;
};
