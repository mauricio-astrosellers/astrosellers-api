const express = require('express');
const router = express.Router();

const MAX_OUTPUT_TOKENS = 8000;

router.post('/', async (req, res) => {
  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY no configurada' });
  }

  try {
    const { model, max_tokens, messages } = req.body;

    // Control de costos: cada llamada máximo 4000 tokens (dos llamadas = ~$0.12 max)
    const safeMaxTokens = Math.min(max_tokens || 1000, MAX_OUTPUT_TOKENS);

    // Log de request
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      action: 'claude_request',
      model: model || 'claude-sonnet-4-20250514',
      max_tokens: safeMaxTokens,
      estimated_max_cost_usd: (safeMaxTokens / 1000000 * 15).toFixed(4)
    }));

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model || 'claude-sonnet-4-20250514',
        max_tokens: safeMaxTokens,
        messages
      })
    });

    const data = await response.json();

    // Log de uso real
    if (data.usage) {
      const inputCost = data.usage.input_tokens / 1000000 * 3;
      const outputCost = data.usage.output_tokens / 1000000 * 15;
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        action: 'claude_response',
        input_tokens: data.usage.input_tokens,
        output_tokens: data.usage.output_tokens,
        total_cost_usd: (inputCost + outputCost).toFixed(4)
      }));
    }

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);

  } catch (error) {
    console.error('Claude error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
