// Importa as bibliotecas que acabamos de instalar
import express from 'express';
import cors from 'cors';

// Módulos para lidar com caminhos de arquivos
import path from 'path';
import { fileURLToPath } from 'url';

import 'dotenv/config'; // Carrega as variáveis do arquivo .env

// Cria a aplicação do servidor
const app = express();
const PORT = 3000; // A porta onde nosso servidor vai rodar

// Configurações do servidor
app.use(cors()); // Habilita o CORS para permitir a comunicação entre diferentes origens
app.use(express.json()); // Permite que o servidor entenda requisições com corpo em JSON

// Configuração para servir arquivos estáticos (HTML, CSS, JS do front-end)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// A linha abaixo diz ao Express para servir os arquivos da pasta atual
app.use(express.static(__dirname));

// Pega a chave da API do arquivo .env (de forma segura)
const apiKey = process.env.GEMINI_API_KEY;
const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

/**
 * Nosso novo endpoint de API seguro.
 * O front-end vai chamar 'http://localhost:3000/api/search?termo=...'
 */
app.get('/api/search', async (req, res) => {
    // Pega o termo de busca que o front-end enviou (ex: 'javascript')
    const termoBusca = req.query.termo;

    if (!termoBusca) {
        return res.status(400).json({ error: 'O termo de busca é obrigatório.' });
    }

    console.log(`Recebida busca pelo termo: ${termoBusca}`);

    // Monta o prompt para a API da Gemini
    const prompt = `Gere uma descrição detalhada para a tecnologia: "${termoBusca}". Siga estritamente a estrutura JSON abaixo. Se não conhecer a tecnologia, retorne um objeto com o campo "nome" igual a "Desconhecido".

    Estrutura JSON esperada:
    {
        "nome": "Nome da tecnologia",
        "descricao": "Descrição concisa da tecnologia.",
        "data_criacao": "Ano de criação (ex: '2013').",
        "link": "URL oficial ou de documentação.",
        "tags": ["tag1", "tag2", "tag3"]
    }`;

    try {
        // Faz a chamada para a API da Gemini (aqui a chave está segura)
        const response = await fetch(geminiApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        if (!response.ok) {
            throw new Error(`Erro na API da Gemini: ${response.statusText}`);
        }

        const result = await response.json();
        // Envia a resposta da Gemini de volta para o front-end
        res.json(result);

    } catch (error) {
        console.error("Erro ao contatar a API da Gemini:", error);
        res.status(500).json({ error: 'Falha ao comunicar com o serviço da Gemini.' });
    }
});

// Inicia o servidor e o faz "ouvir" na porta definida
app.listen(PORT, () => {
    console.log(`🚀 Servidor proxy rodando em http://localhost:${PORT}`);
});