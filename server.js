const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// Conexão com Supabase PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Rota de teste
app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: '🚀 Backend Online + Supabase PostgreSQL!',
    data: new Date().toLocaleString('pt-BR')
  });
});

// Rota que busca do banco
app.get('/api/usuarios', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM usuarios ORDER BY criado_em DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rota para adicionar usuário
app.post('/api/usuarios', async (req, res) => {
  const { nome, email } = req.body;
  
  try {
    const result = await pool.query(
      'INSERT INTO usuarios (nome, email) VALUES ($1, $2) RETURNING *',
      [nome, email]
    );
    res.json({ 
      success: true, 
      user: result.rows[0],
      message: 'Usuário cadastrado!' 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Criar tabela automaticamente
app.get('/api/setup', async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    res.json({ success: true, message: 'Tabela criada/pronta!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('🚀 Backend Online + Supabase PostgreSQL na porta:', PORT);
});
