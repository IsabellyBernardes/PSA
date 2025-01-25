const bcrypt = require('bcryptjs');

// Substitua por qualquer senha que você deseja para o teste
const senhaPlana = 'senhaavaliador';

(async () => {
    const saltRounds = 10;
    const senhaCriptografada = await bcrypt.hash(senhaPlana, saltRounds);
    console.log('Senha criptografada:', senhaCriptografada);
})();
