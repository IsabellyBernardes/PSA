const express = require('express');
const fs = require('fs');
const unzipper = require('unzipper');
const AdmZip = require('adm-zip');
const router = express.Router();
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const Beneficiario = require('./models/beneficiario');
const Avaliador = require('./models/avaliador');
const session = require('express-session');
const { QueryTypes } = require('sequelize');
//const { sequelize } = require('./models');
const sequelize = require('./config/database');
const upload = multer({ dest: 'uploads/' });
const shapefile = require('shapefile');



sequelize.sync({ alter: true })  // Altera as tabelas sem perder os dados
  .then(() => {
    console.log("Tabela 'beneficiarios' sincronizada!");
  })
  .catch((err) => {
    console.error("Erro ao sincronizar a tabela:", err);
  });

sequelize.authenticate()
    .then(() => {
        console.log('Conexão com o banco de dados estabelecida com sucesso.');
    })
    .catch((error) => {
        console.error('Não foi possível conectar ao banco de dados:', error);
    });


// Configurações de conexão com o banco de dados
const app = express();
const pool = new Pool({
    user: 'postgres',           // Nome do usuário do banco
    host: 'localhost',             // Endereço do banco
    database: 'postgres',     // Nome do banco de dados
    password: 'belly789',         // Senha do usuário
    port: 5432,                    // Porta padrão do PostgreSQL
});

// Definir o diretório onde os templates EJS estarão
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/static', express.static(path.join(__dirname, 'static')));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Para fazer o parse de dados do formulário
// Para servir arquivos estáticos, como CSS e imagens


// Configuração do middleware de sessão
app.use(session({
    secret: 'seu-segredo-aqui',  // Uma chave secreta para assinar a sessão
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }  // Altere para true se estiver usando HTTPS
}));

app.get('/', (req, res) => {
    res.render('index');
});


// Função de validação personalizada de CPF 
function validateCPF(cpf) { 
    cpf = cpf.replace(/[^\d]+/g, ''); 
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false; 
    
    let soma = 0; 
    for (let i = 0; i < 9; i++) { 
        soma += parseInt(cpf.charAt(i)) * (10 - i); 
    } 
    
    let resto = 11 - (soma % 11); 
    if (resto === 10 || resto === 11) resto = 0; 
    if (resto !== parseInt(cpf.charAt(9))) return false; 
    
    soma = 0; 
    for (let i = 0; i < 10; i++) { 
        soma += parseInt(cpf.charAt(i)) * (11 - i); 
    } 
    
    resto = 11 - (soma % 11); 
    if (resto === 10 || resto === 11) resto = 0; 
    if (resto !== parseInt(cpf.charAt(10))) return false; 
    
    return true; }

// Rota de cadastro
app.get('/cadastro', (req, res) => { 
    res.render('cadastro', { error: null }); 
});

// Substitua a importação da biblioteca de validação de CPF
// const { CPF } = require('cpf-cnpj-validator');

app.post('/cadastro/beneficiario', async (req, res) => {
    const { nome, email, senha, telefone, cpf: cpfRecebido } = req.body;
    const cleanedCpf = cpfRecebido.replace(/\D/g, '');

    console.log('Dados recebidos no cadastro:', req.body);
    console.log('CPF após limpeza:', cleanedCpf);

    // Verifica se o CPF foi enviado 
    if (!cpfRecebido) {
        console.error('CPF não enviado.');
        return res.status(400).send('CPF não enviado.');
    }
    try {
        // Usando a função de validação personalizada de CPF 
        if (!validateCPF(cleanedCpf)) {
            console.error('CPF inválido:', cleanedCpf);
            return res.status(400).send('CPF inválido.');
        }

        console.log('CPF validado com sucesso:', cleanedCpf);

        // Criptografando a senha do beneficiário 
        const hashedSenha = bcrypt.hashSync(senha, 10);
        // Verificando se o CPF já existe no banco 
        console.log('Verificando se o CPF já existe no banco...');
        const resultCpf = await pool.query('SELECT * FROM beneficiarios WHERE cpf = $1', [cleanedCpf]);
        if (resultCpf.rows.length > 0) {
            console.error('CPF já cadastrado:', cleanedCpf);
            // Renderizar novamente a página de cadastro com a mensagem de erro
            return res.render('cadastro', { error: 'Já existe um beneficiário com esse CPF.' });
        }
        // Verificando se o email já existe no banco 
        console.log('Verificando se o email já existe no banco...');
        const resultEmail = await pool.query('SELECT * FROM beneficiarios WHERE email = $1', [email]);
        if (resultEmail.rows.length > 0) {
            console.error('Email já cadastrado:', email);
            return res.render('cadastro', { error: 'Já existe um beneficiário com esse email.' });
        }
        // Inserindo o beneficiário no banco 
        console.log('Inserindo beneficiário no banco de dados...');
        await pool.query(
            'INSERT INTO beneficiarios (nome, email, senha, telefone, cpf) VALUES ($1, $2, $3, $4, $5)',
            [nome, email, hashedSenha, telefone, cleanedCpf]
        );
        console.log('Beneficiário cadastrado com sucesso:', { nome, email, telefone, cpf: cleanedCpf });
        // Redirecionando para a página de login 
        res.redirect('/login/beneficiario-login');

        const user = req.user;

    } catch (error) {
        console.error('Erro ao cadastrar o beneficiário:', error);
        res.status(500).send('Erro ao cadastrar o beneficiário.');
    }
});



// Rota para exibir a página de seleção de tipo de login
app.get('/login-type', (req, res) => {
    res.render('login-type');
});

app.get('/beneficiario-login', (req, res) => {
    res.render('beneficiario-login', { error: null });
});

// Página de login para o Avaliador
app.get('/avaliador-login', (req, res) => {
    res.render('avaliador-login', { error: null });
});


app.get('/login/beneficiario', (req, res) => {
    res.render('beneficiario-login');  // Renderiza a página de login
});

// Lógica para o login do Beneficiário
app.post('/login/beneficiario', async (req, res) => {
    const { email, senha } = req.body;

    // Consulta direta ao banco para buscar o usuário pelo e-mail
    const [usuario] = await sequelize.query(
        `SELECT * FROM beneficiarios WHERE email = :email`, 
        {
            replacements: { email },
            type: sequelize.QueryTypes.SELECT
        }
    );

    // Verificar se o usuário foi encontrado e se a senha está correta
    if (!usuario || !(await bcrypt.compare(senha, usuario.senha))) {
        return res.render('beneficiario-login', { error: 'Email ou senha incorretos' });
    }

    // Login bem-sucedido
    req.session.user_id = usuario.id;  // Armazena o ID do beneficiário na sessão
    res.redirect('/beneficiario-perfil');  // Redireciona para o perfil do beneficiário
});

// Página do Perfil do Beneficiário
app.get('/beneficiario-perfil', async (req, res) => {
    const usuarioId = req.session.user_id;

    if (!usuarioId) {
        return res.redirect('/login/beneficiario');
    }

    // Consulta com JOIN para buscar o beneficiário e os dados do formulário
    const [resultado] = await sequelize.query(
        `SELECT b.*, c.car_number, c.car_file, c.status 
         FROM beneficiarios b
         LEFT JOIN car_data c ON b.id = c.user_id
         WHERE b.id = :id`,
        {
            replacements: { id: usuarioId },
            type: sequelize.QueryTypes.SELECT,
        }
    );

    if (!resultado) {
        return res.render('beneficiario-login', { error: 'Usuário não encontrado' });
    }

    const usuario = {
        nome: resultado.nome,
        email: resultado.email,
        telefone: resultado.telefone,
    };

    const carData = {
        car_number: resultado.car_number,
        car_file: resultado.car_file,
        status: resultado.status,
    };

    console.log(usuario);
    res.render('beneficiario-perfil', { usuario: usuario, carData: carData.car_number ? carData : null });

});




// Rota para fazer logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).send('Erro ao fazer logout.');
      }
      res.redirect('/login');  // Redireciona de volta para o login
    });
  });
  

// Lógica para o login do Avaliador //TODO
app.post('/login/avaliador-perfil', async (req, res) => {
    const { email, senha } = req.body;

    try {
        // Consulta SQL para buscar o avaliador pelo e-mail e senha (sem utilizar findOne)
        const [resultado] = await sequelize.query(
            `SELECT a.* 
                    FROM avaliadores a
            WHERE a.email = :email`,
            {
                replacements: { email },
                type: sequelize.QueryTypes.SELECT,
            }
        );

        if (!resultado) {
            return res.render('avaliador-login', { error: 'Email ou senha incorretos' });
        }

        // Comparar a senha recebida com a senha do banco
        const senhaValida = await bcrypt.compare(senha, resultado.senha);
        
        if (!senhaValida) {
            return res.render('avaliador-login', { error: 'Email ou senha incorretos' });
        }

        // Login bem-sucedido
        req.session.usuarioId = resultado.id;
        res.redirect('/avaliador-perfil');
    } catch (error) {
        console.error('Erro ao realizar login:', error);
        res.status(500).send('Erro ao realizar login');
    }
});

app.get('/avaliador-perfil', async (req, res) => {
    const usuarioId = req.session.usuarioId;

    if (!usuarioId) {
        return res.redirect('/login/avaliador');
    }

    try {
        // Consulta os dados do avaliador e os arquivos na tabela car_data
        const [resultado] = await sequelize.query(
            `SELECT a.*, c.car_number, c.car_file
             FROM avaliadores a
             LEFT JOIN car_data c ON a.id = c.user_id
             WHERE a.id = :id`,
            {
                replacements: { id: usuarioId },
                type: sequelize.QueryTypes.SELECT,
            }
        );

        if (!resultado) {
            return res.render('avaliador-login', { error: 'Usuário não encontrado' });
        }

        const usuario = {
            nome: resultado.nome,
            email: resultado.email,
        };

        const carData = {
            car_number: resultado.car_number,
            file_path: resultado.car_file,
        };

        // Passando carData junto com usuário e requests para o EJS
        const requests = carData.car_number ? [{ car_number: carData.car_number, file_path: carData.file_path }] : [];

        res.render('avaliador-perfil', { usuario, carData, requests });

    } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        res.status(500).send('Erro ao carregar perfil');
    }
});


// Rota para visualizar o perfil do avaliador
// Rota para o perfil do avaliador
router.get('/avaliador-perfil', async (req, res) => {
    try {
        // Busca todas as requisições com status "ainda não analisado" ou "em andamento"
        const requests = await Avaliador.getPendingRequests(); // Implementaremos essa função no modelo
        res.render('avaliador-perfil', { requests }); // Renderiza a página com os dados
    } catch (error) {
        console.error('Erro ao carregar perfil do avaliador:', error);
        res.status(500).send('Erro ao carregar dados.');
    }
});

// Rota para exibir o formulário do CAR
app.get('/car_form', (req, res) => {
    res.render('car_form'); 
});


app.get('/processos-pendentes', async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM car_data WHERE status = $1", ['Ainda não analisado']);
        res.render('processos-pendentes', { processos: result.rows });
    } catch (error) {
        console.error('Erro ao buscar processos pendentes:', error);
        res.status(500).send('Erro ao buscar processos');
    }
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// Rota para mostrar o perfil do beneficiário
router.get('/beneficiario-perfil', async (req, res) => {
    try {
      // Pegando o e-mail do beneficiário do usuário logado
      const email = req.session.email;  // Ou a variável que você usa para identificar o usuário logado
  
      // Encontrar o beneficiário com esse e-mail
      const beneficiario = await Beneficiario.findOne({
        where: { email }
      });
  
      if (!beneficiario) {
        return res.status(404).send('Beneficiário não encontrado.');
      }
  
      // Buscar o formulário CAR, se existir
      const carData = await CarData.findOne({
        where: { beneficiarioId: beneficiario.id }
      });
  
      // Renderizar a página de perfil com os dados do beneficiário
      res.render('beneficiario-perfil', { usuario: usuario, carData: carData.car_number ? carData : null });
    } catch (error) {
      console.error("Erro ao carregar o perfil:", error);
      res.status(500).send("Erro ao carregar o perfil.");
    }
  });
  
  module.exports = router;
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Defina a configuração do multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/'); // Define a pasta de destino
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname); // Salva com o nome original
    }
  });
  
  // Rota para salvar o arquivo
  app.post('/saveCarData', upload.single('car_file'), (req, res) => {
      console.log('Arquivo recebido:', req.file);
      console.log('Car Number:', req.body.carNumber);
  
      // Verificar se o arquivo ZIP foi realmente carregado
      if (!req.file || !fs.existsSync(req.file.path)) {
          console.log('Erro: Arquivo ZIP não encontrado!');
          return res.status(400).send('Erro: Nenhum arquivo ZIP recebido.');
      }
  
      console.log('Arquivo movido para:', req.file.path);
      res.send('Arquivo ZIP recebido e salvo com sucesso!');
  });



app.get('/map', (req, res) => {
    res.render('map');  // Garante que o EJS para 'map' seja renderizado
});


// Inicia o servidor na porta 3000
const port = 3000;
app.listen(3000, '0.0.0.0', () => {
    console.log("Servidor rodando na porta 3000");
});

