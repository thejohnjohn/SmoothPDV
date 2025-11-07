import knex from 'knex';
import knexConfig from '../../knexfile.js';

const db = knex(knexConfig.development);

// Test connection
db.raw('SELECT 1')
  .then(() => console.log('✅ Conectado ao PostgreSQL - smooth-pdv'))
  .catch(err => console.log('❌ Erro na conexão:', err.message));

export default db;