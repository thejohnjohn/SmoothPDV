// Middleware para verificar se usuário pode cadastrar outros usuários
export const canRegisterUsers = (req, res, next) => {
  if (!req.user.canRegisterUsers()) {
    return res.status(403).json({ 
      error: 'Acesso negado. Permissão insuficiente para cadastrar usuários.' 
    });
  }
  next();
};

// Middleware para verificar se usuário pode cadastrar produtos
export const canRegisterProducts = (req, res, next) => {
  if (!req.user.canRegisterProducts()) {
    return res.status(403).json({ 
      error: 'Acesso negado. Permissão insuficiente para cadastrar produtos.' 
    });
  }
  next();
};

// Middleware para verificar tipos específicos de usuário
export const requireAdmin = (req, res, next) => {
  if (!req.user.isAdmin()) {
    return res.status(403).json({ error: 'Acesso restrito a administradores.' });
  }
  next();
};

export const requireGerenteOrAdmin = (req, res, next) => {
  if (!req.user.isAdmin() && !req.user.isGerente()) {
    return res.status(403).json({ error: 'Acesso restrito a gerentes e administradores.' });
  }
  next();
};