export const canRegisterUsers = (req, res, next) => {
  const user = req.user;

  if (user.tipo === 'ADMIN' || user.tipo === 'GERENTE') {
    return next();
  }
  
  return res.status(403).json({ 
    error: 'Acesso negado. Permissão insuficiente para cadastrar usuários.' 
  });
};

export const canRegisterProducts = (req, res, next) => {
  const user = req.user;

  if (['ADMIN', 'GERENTE', 'VENDEDOR'].includes(user.tipo)) {
    return next();
  }
  
  return res.status(403).json({ 
    error: 'Acesso negado. Permissão insuficiente para cadastrar produtos.' 
  });
};

export const requireAdmin = (req, res, next) => {
  if (req.user.tipo === 'ADMIN') {
    return next();
  }
  return res.status(403).json({ error: 'Acesso restrito a administradores.' });
};

export const requireGerenteOrAdmin = (req, res, next) => {
  if (req.user.tipo === 'ADMIN' || req.user.tipo === 'GERENTE') {
    return next();
  }
  return res.status(403).json({ error: 'Acesso restrito a gerentes e administradores.' });
};

export const canAccessStore = (req, res, next) => {
  const user = req.user;
  const storeId = parseInt(req.params.id || req.body.id_loja);
  
  if (user.tipo === 'ADMIN') {
    return next(); 
  }

  if (user.id_loja === storeId) {
    return next();
  }

  return res.status(403).json({ 
    error: 'Acesso negado a esta loja.' 
  });
};

export const onlyOwnStore = (req, res, next) => {
  const user = req.user;
  
  if (user.tipo === 'ADMIN') {
    return next(); 
  }

  const storeId = parseInt(req.params.id || req.body.id_loja);
  
  if (user.id_loja === storeId) {
    return next();
  }

  return res.status(403).json({ 
    error: 'Ação permitida apenas na própria loja.' 
  });
};

export const canManageManagers = (req, res, next) => {
  const user = req.user;
  
  if (user.tipo === 'ADMIN') {
    return next();
  }
  
  return res.status(403).json({ 
    error: 'Acesso negado. Apenas administradores podem gerenciar gerentes.' 
  });
};

export const canManageSellers = (req, res, next) => {
  const user = req.user;
  
  if (user.tipo === 'ADMIN' || user.tipo === 'GERENTE') {
    return next();
  }
  
  return res.status(403).json({ 
    error: 'Acesso negado. Apenas administradores e gerentes podem gerenciar vendedores.' 
  });
};

export const canManageStores = (req, res, next) => {
  const user = req.user;
  
  if (user.tipo === 'ADMIN') {
    return next();
  }
  
  return res.status(403).json({ 
    error: 'Acesso negado. Apenas administradores podem gerenciar lojas.' 
  });
};

export const validateSellerStoreAccess = (req, res, next) => {
  const user = req.user;
  const storeId = parseInt(req.body.id_loja || req.params.id_loja);

  if (user.tipo === 'ADMIN') {
    return next();
  }

  if (user.tipo === 'GERENTE') {
    if (user.id_loja === storeId) {
      return next();
    }
    return res.status(403).json({ 
      error: 'Gerentes só podem gerenciar vendedores na sua própria loja.' 
    });
  }

  return res.status(403).json({ 
    error: 'Acesso negado para gerenciar vendedores.' 
  });
};

export const canManageProducts = (req, res, next) => {
  const user = req.user;
  
  if (user.tipo === 'GERENTE') {
    return next();
  }
  
  return res.status(403).json({ 
    error: 'Acesso negado. Apenas gerentes podem gerenciar mercadorias.' 
  });
};

export const validateProductStoreAccess = (req, res, next) => {
  const user = req.user;

  if (user.tipo !== 'GERENTE') {
    return res.status(403).json({ 
      error: 'Acesso negado para gerenciar mercadorias.' 
    });
  }

  if (req.method === 'POST') {
    req.body.id_loja = user.id_loja;
    return next();
  }

  return next();
};

export const requireSeller = (req, res, next) => {
  const user = req.user;
  
  if (user.tipo === 'VENDEDOR') {
    return next();
  }
  
  return res.status(403).json({ 
    error: 'Acesso negado. Apenas vendedores podem acessar esta funcionalidade.' 
  });
};

export const canSell = (req, res, next) => {
  const user = req.user;
  
  if (['VENDEDOR', 'GERENTE', 'ADMIN'].includes(user.tipo)) {
    return next();
  }
  
  return res.status(403).json({ 
    error: 'Acesso negado. Permissão insuficiente para registrar vendas.' 
  });
};

export const canGenerateReports = (req, res, next) => {
  const user = req.user;
  
  if (['VENDEDOR', 'GERENTE', 'ADMIN'].includes(user.tipo)) {
    return next();
  }
  
  return res.status(403).json({ 
    error: 'Acesso negado. Permissão insuficiente para gerar relatórios.' 
  });
};