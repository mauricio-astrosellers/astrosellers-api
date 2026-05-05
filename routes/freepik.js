const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  const FREEPIK_KEY = process.env.FREEPIK_API_KEY;
  if (!FREEPIK_KEY) {
    return res.status(500).json({ error: 'FREEPIK_API_KEY no configurada' });
  }

  try {
    var prompt = req.body.prompt;
    if (!prompt) {
      return res.status(400).json({ error: 'prompt requerido' });
    }

    var payload = {
      prompt: prompt,
      resolution: req.body.resolution || '2k',
      aspect_ratio: req.body.aspect_ratio || 'square_1_1',
      model: req.body.model || 'realism',
      engine: req.body.engine || 'automatic',
      creative_detailing: req.body.creative_detailing || 33,
      filter_nsfw: true
    };

    if (req.body.colors && req.body.colors.length > 0) {
      payload.styling = {
        colors: req.body.colors.map(function(c) { return { color: c, weight: 0.5 }; })
      };
    }

    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      action: 'freepik_request',
      prompt: prompt.substring(0, 100)
    }));

    var response = await fetch('https://api.freepik.com/v1/ai/mystic', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-freepik-api-key': FREEPIK_KEY
      },
      body: JSON.stringify(payload)
    });

    var data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error) {
    console.error('Freepik POST error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

router.get('/status/:taskId', async (req, res) => {
  var FREEPIK_KEY = process.env.FREEPIK_API_KEY;
  if (!FREEPIK_KEY) {
    return res.status(500).json({ error: 'FREEPIK_API_KEY no configurada' });
  }

  try {
    var response = await fetch('https://api.freepik.com/v1/ai/mystic/' + req.params.taskId, {
      method: 'GET',
      headers: { 'x-freepik-api-key': FREEPIK_KEY }
    });

    var data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error) {
    console.error('Freepik GET error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
