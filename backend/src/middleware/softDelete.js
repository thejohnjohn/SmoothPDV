export const softDeleteMiddleware = (req, res, next) => {
  const originalQueryBuilder = req.db.queryBuilder;

  req.db.queryBuilder = function() {
    const query = originalQueryBuilder.apply(this, arguments);
    const originalWhere = query.where;
    
    query.where = function() {
      const isSoftDeleteQuery = arguments[0] === 'deleted' || 
                               (arguments[0] && arguments[0].deleted !== undefined);
      
      if (!isSoftDeleteQuery && this._single && this._single.table) {
        const tableName = this._single.table;
        const tablesWithSoftDelete = ['loja', 'usuario', 'mercadoria', 'compra'];
        
        if (tablesWithSoftDelete.includes(tableName)) {
          originalWhere.call(this, { deleted: false });
        }
      }
      
      return originalWhere.apply(this, arguments);
    };
    
    return query;
  };
  
  next();
};

export const softDelete = {
  async delete(db, table, id, userId) {
    return await db(table)
      .where('id', id)
      .update({
        deleted: true,
        deleted_at: new Date(),
        deleted_by: userId
      });
  },

  async restore(db, table, id, userId) {
    return await db(table)
      .where('id', id)
      .where('deleted', true)
      .update({
        deleted: false,
        deleted_at: null,
        deleted_by: null,
        restored_at: new Date(),
        restored_by: userId
      });
  },

  async findWithDeleted(db, table, conditions = {}) {
    return await db(table)
      .where(conditions);
  },

  async findOnlyDeleted(db, table, conditions = {}) {
    return await db(table)
      .where({ ...conditions, deleted: true });
  },

  async forceDelete(db, table, id) {
    return await db(table)
      .where('id', id)
      .delete();
  }
};