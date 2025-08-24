import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { documentName, fileType, fileText } = await req.json();

    if (!fileText || !fileText.trim()) {
      return NextResponse.json(
        { success: false, error: "No text provided for plagiarism check" },
        { status: 400 }
      );
    }

    // Initialize Gemini client
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const nowIso = new Date().toISOString();

    const prompt = `
You are a plagiarism + AI writing detector.

INPUT
- Document Name: ${documentName}
- File Type: ${fileType}
- Current Time: ${nowIso}

DOCUMENT TEXT
---------------- BEGIN ----------------
${fileText}
----------------- END -----------------

TASKS
1. Plagiarism Check:
   - plagiarism.score: integer 0–100 (higher = more copied/unoriginal)
   - plagiarism.matchedSources: up to 10 overlaps, each with {source, overlapSnippet, similarity 0–1}
   - plagiarism.reasoning: 1 short paragraph explanation
2. AI Writing Detection:
   - aiDetection.isAI: true/false (likely AI-generated?)
   - aiDetection.confidence: 0–1 number
   - aiDetection.comment: short explanation
3. Word Count:
   - wordCount: number of words in document

RULES
- Don’t invent URLs. Use general names only (e.g., “Wikipedia”, “Nature 2020”).
- If uncertain about plagiarism, keep matchedSources empty and score low.
- Confidence must be numeric 0–1.
- Return ONLY valid JSON. No markdown fences.
`;

    // Generate content
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" },
    });

    const aiText = result.response.text();

    let parsed: any;
    try {
      parsed = JSON.parse(aiText);
    } catch {
      const cleaned = aiText.replace(/```json?/g, "").replace(/```/g, "").trim();
      parsed = JSON.parse(cleaned);
    }

    // fallback wordCount if not provided
    if (typeof parsed.wordCount !== "number") {
      parsed.wordCount = (fileText.match(/\S+/g) || []).length;
    }

    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error("Plagiarism API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
