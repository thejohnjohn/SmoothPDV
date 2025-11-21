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
  idcompra: number;
}
