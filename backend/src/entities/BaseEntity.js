export class BaseEntity {
  constructor(data) {
    this.id = data.id;
    this.deleted = data.deleted || false;
    this.deleted_at = data.deleted_at;
    this.deleted_by = data.deleted_by;
    this.criado_em = data.criado_em;
  }

  static async findById(db, id, includeDeleted = false) {
    let query = db(this.tableName).where('id', id);
    
    if (!includeDeleted) {
      query = query.where('deleted', false);
    }
    
    const record = await query.first();
    return record ? new this(record) : null;
  }

  static async findAll(db, conditions = {}, includeDeleted = false) {
    let query = db(this.tableName).where(conditions);
    
    if (!includeDeleted) {
      query = query.where('deleted', false);
    }
    
    const records = await query;
    return records.map(record => new this(record));
  }

  static async softDelete(db, id, userId) {
    return await db(this.tableName)
      .where('id', id)
      .update({
        deleted: true,
        deleted_at: new Date(),
        deleted_by: userId
      });
  }

  static async restore(db, id, userId) {
    return await db(this.tableName)
      .where('id', id)
      .where('deleted', true)
      .update({
        deleted: false,
        deleted_at: null,
        deleted_by: null
      });
  }
}