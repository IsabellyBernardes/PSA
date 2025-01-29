const multer = require('multer');
const path = require('path');
const fs = require('fs');


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

module.exports = upload;
