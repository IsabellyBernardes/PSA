const multer = require('multer');
const unzipper = require('unzipper');
const fs = require('fs');
const path = require('path');


// Função de filtro para aceitar apenas arquivos .zip
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/zip') {
    cb(null, true); // Aceita o arquivo
  } else {
    cb(new Error('Apenas arquivos ZIP são permitidos!'), false); // Rejeita o arquivo
  }
};

// Inicializando o middleware de upload com a configuração de armazenamento e o filtro de arquivos
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  dest: 'uploads/'
});


module.exports = upload;
