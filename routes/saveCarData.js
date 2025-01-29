const express = require('express');
const router = express.Router();
const upload = require('../upload'); // Certifique-se de que o caminho do upload está correto
const CarData = require('../models/car_data'); // Certifique-se de que o modelo está correto

router.post('/saveCarData', upload.single('car_file'), async (req, res) => {
    try {
        console.log('Requisição recebida para /saveCarData');

        // Logando os dados recebidos
        const userId = req.session.user_id; // ID do usuário logado
        const carNumber = req.body.carNumber; // Número do CAR
        const carFilePath = req.file ? req.file.path : null; // Caminho do arquivo, se enviado

        // Logs para verificar os dados recebidos
        console.log('userId:', userId);
        console.log('carNumber:', carNumber);
        console.log('carFilePath:', carFilePath);

        if (!userId) {
            console.log('Erro: Usuário não autenticado.');
            return res.status(400).send('Usuário não está autenticado.');
        }

        if (!carFilePath) {
            console.log('Erro: Nenhum arquivo enviado.');
            return res.status(400).send('Nenhum arquivo enviado.');
        }

        if (!carNumber) {
            console.log('Erro: Número do CAR é obrigatório.');
            return res.status(400).send('Número do CAR é obrigatório.');
        }

        // Salva os dados no banco
        console.log('Salvando no banco...');
        await CarData.create({
            user_id: userId,
            car_number: carNumber,
            car_file: carFilePath, // Caminho do arquivo na pasta uploads
            status: 'Em análise', // Status padrão
        });

        console.log('Arquivo e dados salvos com sucesso!');
        res.redirect('/beneficiario-perfil'); // Redireciona para a página do perfil do beneficiário
    } catch (error) {
        console.error('Erro ao salvar:', error);
        res.status(500).send('Erro ao salvar os dados');
    }
});

module.exports = router;
