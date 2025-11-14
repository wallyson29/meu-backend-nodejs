const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
app.use(cors());
app.use(express.json());

// Conexão com MySQL (Railway vai fornecer)
const db = mysql.createConnection(process.env.DATABASE_URL);

// Conecta ao MySQL
db.connect((err) => {
  if (err) {
    console.log('❌ Erro MySQL:', err.message);
  } else {
    console.log('✅ Conectado ao MySQL!');
    
    // Cria tabela se não existir
    db.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) console.log('Erro criar tabela:', err);
      else console.log('✅ Tabela usuarios pronta!');
    });
  }
});

// Rota de teste
app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: '🚀 Backend Online no Railway!',
    data: new Date().toLocaleString('pt-BR')
  });
});

// Rota que busca do banco
app.get('/api/usuarios', (req, res) => {
  db.query('SELECT * FROM usuarios ORDER BY criado_em DESC', (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(results);
    }
  });
});

// Rota para adicionar usuário
app.post('/api/usuarios', (req, res) => {
  const { nome, email } = req.body;
  
  db.query(
    'INSERT INTO usuarios (nome, email) VALUES (?, ?)',
    [nome, email],
    (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ 
          success: true, 
          id: result.insertId,
          message: 'Usuário cadastrado!' 
        });
      }
    }
  );
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('🚀 Backend Online na porta:', PORT);
});
