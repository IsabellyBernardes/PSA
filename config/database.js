// config/database.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('postgres://postgres:belly789@localhost:5432/postgres', {
    dialect: 'postgres', // Definindo o banco de dados como PostgreSQL
    logging: false, // Desativa o log de SQL (opcional)
  });
  

// Testando a conexão
sequelize.authenticate()
  .then(() => {
    console.log('Conexão com o banco de dados estabelecida com sucesso.');
  })
  .catch((error) => {
    console.error('Não foi possível conectar ao banco de dados:', error);
  });

module.exports = sequelize;  // Exportando a instância de conexão

