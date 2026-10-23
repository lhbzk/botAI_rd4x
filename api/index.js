const express = require('express');
const app = express();

app.use(express.json());

let mensagens = [];

app.get('/', (req, res) => {
    res.json({ status: "API Rd4X Serverless Online!", data: new Date() });
});

app.post('/api/enviar', (req, res) => {
    const { usuario, texto, hora } = req.body;
    
    if (usuario && texto) {
        const novaMsg = { usuario, texto, hora, id: Date.now() };
        mensagens.push(novaMsg);
        
        if (mensagens.length > 50) mensagens.shift();
        
        return res.status(200).json({ status: "sucesso", msg: novaMsg });
    }
    return res.status(400).json({ erro: "Dados inválidos" });
});

app.get('/api/mensagens', (req, res) => {
    res.json(mensagens);
});

app.post('/api/ticket', (req, res) => {
    const authHeader = req.headers['authorization'];
    if (authHeader !== 'SUA_CHAVE_PRIVADA_RD4X') {
        return res.status(401).json({ erro: 'Acesso negado!' });
    }

    const { usuarioRoblox, assunto } = req.body;
    return res.json({ status: "Ticket recebido com sucesso!", usuarioRoblox, assunto });
});

module.exports = app;
