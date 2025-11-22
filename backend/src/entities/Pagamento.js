export class Pagamento {
  constructor(data) {
    this.id = data.id;
    this.data = data.data;
    this.valor = data.valor;
    this.metodo_pagamento = data.metodo_pagamento || 'DINHEIRO';
    this.status = data.status || 'APROVADO';
    this.troco = data.troco || 0;
    this.observacao = data.observacao;
    this.idcompra = data.idcompra;
  }

  static async findBySaleId(db, saleId) {
    const payments = await db('pagamento').where('idcompra', saleId);
    return payments.map(payment => new Pagamento(payment));
  }

  static async create(db, paymentData) {
    const [{ id }] = await db('pagamento').insert(paymentData).returning('id');
    return id;
  }

  // Validar método de pagamento
  static isValidPaymentMethod(method) {
    const validMethods = ['DINHEIRO', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'PIX', 'BOLETO'];
    return validMethods.includes(method.toUpperCase());
  }

  // Calcular troco
  static calculateChange(amountPaid, total) {
    return Math.max(0, amountPaid - total);
  }
}

// Métodos de pagamento disponíveis
export const MetodoPagamento = {
  DINHEIRO: 'DINHEIRO',
  CARTAO_CREDITO: 'CARTAO_CREDITO', 
  CARTAO_DEBITO: 'CARTAO_DEBITO',
  PIX: 'PIX',
  BOLETO: 'BOLETO'
};

// Status de pagamento
export const StatusPagamento = {
  APROVADO: 'APROVADO',
  PENDENTE: 'PENDENTE',
  RECUSADO: 'RECUSADO',
  ESTORNADO: 'ESTORNADO'
};