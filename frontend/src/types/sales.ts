export interface Sale {
  id: number;
  data: string;
  id_cliente: number;
  cliente_nome?: string;
  itens: SaleItem[];
  pagamentos: Payment[];
}

export interface SaleItem {
  id: number;
  quantidade: number;
  idmercadoria: number;
  descricao?: string;
  preco?: number;
}

export interface Payment {
  id: number;
  data: string;
  valor: number;
  metodo_pagamento: 'DINHEIRO' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'PIX' | 'BOLETO';
  status: 'APROVADO' | 'PENDENTE' | 'RECUSADO' | 'ESTORNADO';
  troco?: number;
  observacao?: string;
  idcompra: number;
}

export interface CreatePaymentData {
  data: string;
  valor: number;
  metodo_pagamento: string;
  status?: string;
  troco?: number;
  observacao?: string;
}

export interface CreateSaleData {
  data: string;
  id_cliente: number;
  itens: Array<{
    quantidade: number;
    idmercadoria: number;
  }>;
  pagamento: CreatePaymentData; // Agora com método de pagamento
}


