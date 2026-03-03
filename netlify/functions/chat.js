const { Anthropic } = require('@anthropic-ai/sdk');

exports.handler = async (event) => {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const { prompt } = JSON.parse(event.body);

  const response = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022", // The current stable version
    max_tokens: 500,
    messages: [{ role: "user", content: prompt }],
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ message: response.content[0].text }),
  };
};
