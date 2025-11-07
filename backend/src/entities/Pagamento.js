export class Pagamento {
  constructor(data) {
    this.id = data.id;
    this.data = data.data;
    this.valor = data.valor;
    this.idcompra = data.idcompra;
  }

  static async findBySaleId(db, saleId) {
    const payments = await db('pagamento').where('idcompra', saleId);
    return payments.map(payment => new Pagamento(payment));
  }

  static async create(db, paymentData) {
    await db('pagamento').insert(paymentData);
  }
}