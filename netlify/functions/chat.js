const { Anthropic } = require('@anthropic-ai/sdk');

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  
  try {
    // 1. Extract 'model' and 'systemPrompt' alongside your other variables
    const { resumeData, userInstructions, model, systemPrompt } = JSON.parse(event.body);

    // 2. Set the dynamic model, falling back to Sonnet if none is provided
    const targetModel = model || "claude-3-5-sonnet-latest";

    // 3. Define your original fallback system prompt
    const fallbackPrompt = `You are the core Resume Engine for Nish.
1. PURPOSE: You ONLY perform resume extraction, formatting, and impact-driven rewriting.
2. BOUNDARY: If a user asks a non-resume question (e.g., "Tell me a joke" or "Write a story"), you must refuse by saying: "I am only authorized to process resumes for Nish."
3. STANDARDS: Use the STAR method for bullets. Focus on Field related keywords chosen by user if the context allows.
DO NOT invent experience; only reframe existing data.`;

    const response = await anthropic.messages.create({
      model: targetModel, // Uses Haiku or Sonnet based on the frontend request
      max_tokens: 4000,   // Bumped to 4000 to safely fit the large JSON ATS response
      system: systemPrompt || fallbackPrompt, // Uses the frontend's strict prompt if available
      messages: [
        {
          role: "user",
          content: `RESUME DATA: ${resumeData} \n\n TASK: ${userInstructions}`
        }
      ],
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: response.content[0].text }),
    };
    
  } catch (error) {
    console.error("Anthropic API Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to process resume" })
    };
  }
};
