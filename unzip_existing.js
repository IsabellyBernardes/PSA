const fs = require('fs');
const path = require('path');
const unzipper = require('unzipper');

// Função para descompactar o arquivo
async function unzipExisting(zipFilePath) {
    try {
        console.log(`Iniciando a descompactação do arquivo: ${zipFilePath}`);

        const destDir = path.join(__dirname, 'uploads', path.basename(zipFilePath, '.zip'));

        // Cria a pasta de destino, se não existir
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
            console.log(`Pasta ${destDir} criada.`);
        }

        // Descompactando o arquivo zip
        await fs.createReadStream(zipFilePath)
            .pipe(unzipper.Extract({ path: destDir }))
            .promise();

        console.log(`Arquivo descompactado com sucesso em: ${destDir}`);
    } catch (error) {
        console.error('Erro ao descompactar o arquivo:', error);
        throw error;
    }
}

// Exporta a função para ser utilizada em outros arquivos
module.exports = unzipExisting;
