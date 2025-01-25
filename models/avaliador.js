const db = require('../config/database');
 // Importe o módulo de conexão com o banco

const Avaliador = {
    getPendingRequests: async () => {
        try {
            // Consulta as requisições no banco de dados
            const [rows] = await db.query(`
                SELECT carNumber, filePath, status 
                FROM requests
                WHERE status IN ('ainda_nao_analisado', 'em_andamento')
            `);
            return rows; // Retorna os resultados como um array
        } catch (error) {
            console.error('Erro ao buscar requisições pendentes:', error);
            throw error;
        }
    }
};

module.exports = Avaliador;
