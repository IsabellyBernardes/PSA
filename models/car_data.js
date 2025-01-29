const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Caminho do seu arquivo de conexão com o banco

const CarData = sequelize.define('CarData', {
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    car_number: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    car_file: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Esperando análise',
    },
}, {
    timestamps: true, // Adiciona createdAt e updatedAt
    tableName: 'car_data', // Garante que o nome da tabela no banco seja 'car_data'
});

module.exports = CarData;
