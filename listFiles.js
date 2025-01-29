const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'static', 'BR_UF_2023');

fs.readdir(directoryPath, (err, files) => {
    if (err) {
        return console.log('Erro ao listar arquivos do diretório:', err);
    }
    console.log('Arquivos no diretório:', files);
});
