const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('postgres', 'postgres', 'belly789', {
  host: 'localhost',
  dialect: 'postgres',
});

const Beneficiario = require('./beneficiario')(sequelize, DataTypes);

module.exports = {
  sequelize,
  Beneficiario
};
