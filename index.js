require('dotenv').config();
const express = require('express');
const path = require('path');
const OpenAI = require('openai');
const { guardarRecordatorio, obtenerRecordatorios, marcarHecho, eliminarRecordatorio } = require('./firebase');

const app = express();
const PORT = process.env.PORT || 3000;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/chat', async (req, res) => {
  const { mensaje } = req.body;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: `Extrae un recordatorio claro y breve del siguiente mensaje: "${mensaje}". Incluye fecha y hora si las detectas.` }]
    });
    const respuesta = completion.choices[0].message.content;
    await guardarRecordatorio(respuesta);
    res.json({ respuesta });
  } catch (error) {
    console.error("❌ Error al procesar mensaje:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.get('/api/recordatorios', async (req, res) => {
  try {
    const recordatorios = await obtenerRecordatorios();
    res.json({ recordatorios });
  } catch (error) {
    res.status(500).json({ error: "No se pudieron obtener los recordatorios." });
  }
});

app.put('/api/recordatorios/:id/hecho', async (req, res) => {
  try {
    await marcarHecho(req.params.id);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: "No se pudo actualizar el recordatorio." });
  }
});

app.delete('/api/recordatorios/:id', async (req, res) => {
  try {
    await eliminarRecordatorio(req.params.id);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: "No se pudo eliminar el recordatorio." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Bot Asistente activo en http://localhost:${PORT}`);
});
