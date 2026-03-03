const { Anthropic } = require('@anthropic-ai/sdk');

exports.handler = async (event) => {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const { resumeData, userInstructions } = JSON.parse(event.body);

  const response = await anthropic.messages.create({
    model: "claude-3-5-sonnet-latest", // Use the 2026 stable model
    max_tokens: 2500,
    // THE "THREE-WALL" SYSTEM PROMPT
    system: `You are the core Resume Engine for Nish. 
    1. PURPOSE: You ONLY perform resume extraction, formatting, and impact-driven rewriting.
    2. BOUNDARY: If a user asks a non-resume question (e.g., "Tell me a joke" or "Write a story"), you must refuse by saying: "I am only authorized to process resumes for Nish."
    3. STANDARDS: Use the STAR method for bullets. Focus on Field related keywords chosen by user if the context allows. 
    DO NOT invent experience; only reframe existing data.`,
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
};
