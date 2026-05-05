const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY no configurada' });
  }

  try {
    const { model, max_tokens, messages } = req.body;
    const safeMaxTokens = Math.min(max_tokens || 1000, 6000);

    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      action: 'claude_request',
      max_tokens: safeMaxTokens
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
        messages: messages
      })
    });

    const data = await response.json();

    if (data.usage) {
      var inputCost = data.usage.input_tokens / 1000000 * 3;
      var outputCost = data.usage.output_tokens / 1000000 * 15;
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
