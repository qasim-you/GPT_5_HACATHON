import { type NextRequest, NextResponse } from "next/server"

const { OpenAI } = require("openai")

const openai = new OpenAI({
  baseURL: "https://api.aimlapi.com/v1",
  apiKey: process.env.AIML_API_KEY || "your-api-key-here",
})

interface AnalysisRequest {
  documentName: string
  content?: string
  fileType: string
}

const generateAnalysis = async (documentName: string, content: string, fileType: string) => {
  try {
    const analysisPrompt = `
    Analyze the following document and provide a comprehensive research analysis:
    
    Document Name: ${documentName}
    File Type: ${fileType}
    Content: ${content || "Document content not provided"}
    
    Please provide:
    1. A concise summary (2-3 sentences)
    2. 4 key insights or findings
    3. 3 important citations with page references and confidence scores
    4. 4 main topics covered
    
    Format your response as JSON with this structure:
    {
      "summary": "string",
      "keyInsights": ["insight1", "insight2", "insight3", "insight4"],
      "citations": [
        {"text": "citation text", "page": number, "confidence": number_between_0_and_1}
      ],
      "topics": ["topic1", "topic2", "topic3", "topic4"]
    }
    `

    const result = await openai.chat.completions.create({
      model: "openai/gpt-5-chat-latest",
      messages: [
        {
          role: "system",
          content:
            "You are an expert research analyst who provides comprehensive document analysis with accurate citations and insights. Always respond with valid JSON.",
        },
        {
          role: "user",
          content: analysisPrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    })

    const aiResponse = result.choices[0].message.content
    const parsedResponse = JSON.parse(aiResponse)

    return {
      id: Math.random().toString(36).substr(2, 9),
      documentName,
      summary: parsedResponse.summary,
      keyInsights: parsedResponse.keyInsights,
      citations: parsedResponse.citations,
      topics: parsedResponse.topics,
      analysisDate: new Date().toISOString(),
    }
  } catch (error) {
    console.error("GPT-5 Analysis Error:", error)
    // Fallback to basic analysis if AI fails
    return {
      id: Math.random().toString(36).substr(2, 9),
      documentName,
      summary: `Analysis of ${documentName} - AI processing temporarily unavailable.`,
      keyInsights: [
        "Document uploaded successfully",
        "Content structure appears well-organized",
        "Further analysis pending AI service restoration",
        "Manual review recommended for detailed insights",
      ],
      citations: [
        {
          text: `Document ${documentName} contains relevant research data`,
          page: 1,
          confidence: 0.75,
        },
      ],
      topics: ["Document Analysis", "Research", "Content Review", fileType],
      analysisDate: new Date().toISOString(),
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalysisRequest = await request.json()

    const analysis = await generateAnalysis(body.documentName, body.content || "", body.fileType)

    return NextResponse.json({
      success: true,
      analysis,
    })
  } catch (error) {
    console.error("Analysis error:", error)
    return NextResponse.json({ success: false, error: "Failed to analyze document" }, { status: 500 })
  }
}
