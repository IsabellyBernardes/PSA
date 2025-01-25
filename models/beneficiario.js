module.exports = (sequelize, DataTypes) => {
  const Beneficiario = sequelize.define('Beneficiario', {
    nome: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    senha: {
      type: DataTypes.STRING,
      allowNull: false
    },
    telefone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    cpf: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  }, {
    tableName: 'beneficiarios',
    timestamps: true,  // Isso deve funcionar se as colunas existirem corretamente
    createdAt: 'createdat',  // Especificar o nome da coluna se necessário
    updatedAt: 'updatedat'   // Especificar o nome da coluna se necessário
  });

  return Beneficiario;
};
