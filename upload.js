const multer = require('multer');
const path = require('path');
const fs = require('fs');
const unzip = require('unzipper');  // Adicionando o unzipper para extrair o ZIP

const uploadPath = path.join(__dirname, './uploads');
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
    console.log('Pasta "uploads" criada.');
} else {
    console.log('Pasta "uploads" já existe.');
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log('Destino do arquivo:', uploadPath);
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        console.log('Nome do arquivo:', file.originalname);
        cb(null, file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    console.log('Tipo de arquivo:', file.mimetype);
    if (file.mimetype === 'application/zip' || file.mimetype === 'application/x-zip-compressed') {
        cb(null, true);
    } else {
        cb(new Error('Apenas arquivos ZIP são permitidos!'), false);
    }
};

// Configuração do multer com armazenamento e filtro
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // Limite de 10 MB
});

// Função para extrair o arquivo ZIP e buscar o .shp
const extractAndFindShapefile = (zipFilePath, res) => {
    const extractPath = path.join(__dirname, './uploads', 'Area_do_Imovel');  // Diretório de extração

    // Descompactar o arquivo ZIP
    fs.createReadStream(zipFilePath)
        .pipe(unzip.Extract({ path: extractPath }))
        .on('close', () => {
            console.log('Arquivos descompactados em', extractPath);

            // Encontrando o arquivo .shp dentro da pasta Area_do_Imovel
            fs.readdir(extractPath, (err, files) => {
                if (err) {
                    console.log('Erro ao listar arquivos:', err);
                    return;
                }

                // Encontrar o arquivo .shp na pasta
                const shpFile = files.find(file => file.endsWith('.shp'));
                if (shpFile) {
                    const shpFilePath = path.join(extractPath, shpFile);
                    console.log('Arquivo .shp encontrado:', shpFilePath);

                    // Enviar o caminho do .shp para o frontend
                    res.render('avaliador-perfil', { shapefilePath: shpFilePath });
                } else {
                    console.log('Arquivo .shp não encontrado');
                    res.status(400).send('Arquivo .shp não encontrado');
                }
            });
        })
        .on('error', (err) => {
            console.error('Erro ao descompactar o arquivo:', err);
            res.status(500).send('Erro ao processar o arquivo ZIP');
        });
};

module.exports = { upload, extractAndFindShapefile };
