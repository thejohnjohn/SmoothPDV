export interface Product {
  id: number;
  descricao: string;
  preco: number;
  id_usuario?: number;
  vendedor_nome?: string;
  categoria?: string;
}

export interface ProductFormData {
  descricao: string;
  preco: number;
  id_usuario?: number;
  categoria?: string;
}