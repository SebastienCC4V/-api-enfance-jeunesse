const express = require('express');
const router = express.Router();
const client = require('./db');

router.post('/planning/save', async (req, res) => {
  try {
    const data = req.body;
    const result = await client.query('INSERT INTO planning(data) VALUES($1) RETURNING id', [JSON.stringify(data)]);
    res.json({ id: result.rows[0].id });
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la sauvegarde');
  }
});

router.get('/planning/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const result = await client.query('SELECT data FROM planning WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).send('Planning non trouvé');
    }
    res.json(JSON.parse(result.rows[0].data));
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors du chargement');
  }
});

module.exports = router;