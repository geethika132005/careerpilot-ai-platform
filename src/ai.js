function getApiKey() {
  return import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem("gemini_api_key");
}

async function fetchWithRetry(url, options = {}, maxRetries = 3) {
  let delay = 3000;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      
      if (response.ok) {
        return data;
      }

      if ((response.status === 429 || response.status === 503) && i < maxRetries - 1) {
        console.warn(`Gemini API rate limit/overload (${response.status}). Retrying in ${delay / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
        continue;
      }

      throw new Error(`[${response.status}] ${data.error?.message || "Unknown API error"}`);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
}

async function getBestModelName(apiKey) {
  try {
    const localModel = localStorage.getItem("gemini_model");
    if (localModel && (localModel.includes("gemini-2.0") || localModel.includes("gemini-2.5"))) {
      localStorage.removeItem("gemini_model");
    }

    const modelsRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const modelsData = await modelsRes.json();
    
    if (!modelsRes.ok) {
      throw new Error(modelsData.error?.message || "Invalid API Key");
    }

    const availableModels = modelsData.models
      .filter(m => m.supportedGenerationMethods.includes("generateContent"))
      .map(m => m.name.split("/").pop());

    if (availableModels.length === 0) {
      throw new Error("No Gemini models available for content generation on this API key.");
    }

    const configuredModel = import.meta.env.VITE_GEMINI_MODEL || localStorage.getItem("gemini_model");
    if (configuredModel && availableModels.includes(configuredModel)) {
      return configuredModel;
    }

    const preferredModels = [
      "gemini-1.5-flash-8b",
      "gemini-1.5-flash",
      "gemini-1.5-pro",
      "gemini-1.0-pro"
    ];

    for (const pref of preferredModels) {
      const found = availableModels.find(name => name.toLowerCase().includes(pref));
      if (found) return found;
    }

    return availableModels[0];
  } catch (error) {
    console.error(error);
    return "gemini-1.5-flash-8b";
  }
}

export async function generateInterviewPrep(company, role) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("Gemini API Key not configured. Please set VITE_GEMINI_API_KEY in your .env file.");

  const prompt = `Act as an expert technical recruiter and interview coach. 
  The user is applying for the role of "${role || 'an open position'}" at "${company || 'a company'}".
  
  Generate a concise, punchy interview cheat sheet containing:
  ### 🎯 Top 3 Probable Questions
  [List the top 3 most likely questions they will face for this role at this company]

  ### 💡 Insider Tips
  [List 2-3 specific, highly actionable tips on how to pass the interview here based on known company culture or generic engineering values]
  
  Format the output purely in clean Markdown without any conversational filler like "Here is your cheat sheet".`;

  try {
    const modelName = await getBestModelName(apiKey);
    const data = await fetchWithRetry(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function generateFollowUpEmail(company, role) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("Gemini API Key not configured. Please set VITE_GEMINI_API_KEY in your .env file.");

  const prompt = `Write a short, highly professional follow-up email inquiring about a job application.
  - Company: "${company || 'your company'}"
  - Role: "${role || 'an open position'}"
  - Addressee: Hiring Team
  
  The tone should be polite, enthusiastic, and very concise. Format it natively so it looks like an email draft. Do not wrap it in a markdown code block. Include a Subject line. Use bolding for the Subject line.`;

  try {
    const modelName = await getBestModelName(apiKey);
    const data = await fetchWithRetry(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function sendInterviewChatMessage(history, company, role) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("Gemini API Key not configured. Please set VITE_GEMINI_API_KEY in your .env file.");

  const systemPrompt = `You are an expert technical and behavioral mock interviewer. 
  The user is preparing for a "${role || 'an open engineering'}" role at "${company || 'a technology company'}".
  
  Your goal is to conduct a realistic, friendly, and challenging mock interview. 
  Guidelines:
  1. Ask exactly ONE question at a time.
  2. Start with a warm greeting and request details if the user hasn't specified them, or dive into a role-specific question (can be behavioral, coding/algorithm logic, or system design depending on the role).
  3. Respond naturally to the user's answers. Provide very brief constructive feedback (1-2 sentences max) before moving on to the next question.
  4. If the user asks for a hint, give a subtle nudge/clue rather than giving away the answer.
  5. Keep your responses relatively concise (under 120 words) to maintain a chat-like pace.`;

  try {
    const modelName = await getBestModelName(apiKey);
    const formattedContents = history.map(msg => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.text }]
    }));

    const data = await fetchWithRetry(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: formattedContents,
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        }
      })
    });
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function evaluateInterview(history, company, role) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("Gemini API Key not configured. Please set VITE_GEMINI_API_KEY in your .env file.");

  const formattedChatText = history
    .map(msg => `${msg.role === "assistant" ? "Interviewer" : "Candidate"}: ${msg.text}`)
    .join("\n\n");

  const prompt = `Act as an expert technical interviewer and coach. 
  The user has just completed a mock interview for the role of "${role}" at "${company}".
  
  Here is the full transcript of the conversation:
  """
  ${formattedChatText}
  """
  
  Analyze the candidate's answers and provide a detailed evaluation.
  Format your response in clean Markdown with the following sections:
  
  ### 📊 Overall Score: [X/10]
  
  ### 🌟 Strong Points
  [Highlight 2-3 key strengths demonstrated by the candidate based on their responses]
  
  ### 🛠️ Areas for Improvement
  [Highlight 2-3 specific constructive areas where their answers could be improved, e.g. using the STAR method, clarifying technical trade-offs]
  
  ### 💡 Suggested Sample Answers
  [Choose 1 or 2 questions from the interview and provide a sample answer that would stand out to a recruiter]
  
  Keep the feedback professional, encouraging, and highly constructive. Do not include introductory/outro conversational filler.`;

  try {
    const modelName = await getBestModelName(apiKey);
    const data = await fetchWithRetry(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    throw new Error(error.message);
  }
}
