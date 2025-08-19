import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "your-gemini-api-key-here")

interface ChatRequest {
  question: string
  documentId: string
  context?: string
}

const generateAnswer = async (question: string, documentId: string, context?: string) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    const chatPrompt = `
    You are answering questions about a research document. 
    
    Question: ${question}
    Document ID: ${documentId}
    Context: ${context || "No additional context provided"}
    
    Please provide:
    1. A comprehensive answer to the question
    2. A confidence score (0-1)
    3. 2 relevant source citations with page numbers
    
    Format your response as JSON:
    {
      "answer": "detailed answer string",
      "confidence": number_between_0_and_1,
      "sources": [
        {"page": number, "text": "relevant citation text"}
      ]
    }
    `

    const result = await model.generateContent(chatPrompt)
    const response = await result.response
    const aiResponse = response.text()

    // Clean the response to extract JSON
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
    const cleanedResponse = jsonMatch ? jsonMatch[0] : aiResponse
    const parsedResponse = JSON.parse(cleanedResponse)

    return {
      answer: parsedResponse.answer,
      confidence: parsedResponse.confidence,
      sources: parsedResponse.sources,
    }
  } catch (error) {
    console.error("Gemini Chat Error:", error)
    // Fallback response if AI fails
    return {
      answer:
        "I apologize, but I'm currently unable to process your question due to a temporary AI service issue. Please try again in a moment, or rephrase your question.",
      confidence: 0.5,
      sources: [{ page: 1, text: "AI service temporarily unavailable" }],
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json()

    const response = await generateAnswer(body.question, body.documentId, body.context)

    return NextResponse.json({
      success: true,
      ...response,
    })
  } catch (error) {
    console.error("Chat error:", error)
    return NextResponse.json({ success: false, error: "Failed to generate response" }, { status: 500 })
  }
}


// import { type NextRequest, NextResponse } from "next/server"

// const { OpenAI } = require("openai")

// const openai = new OpenAI({
//   baseURL: "https://api.aimlapi.com/v1",
//   apiKey: process.env.AIML_API_KEY || "your-api-key-here",
// })

// interface ChatRequest {
//   question: string
//   documentId: string
//   context?: string
// }

// const generateAnswer = async (question: string, documentId: string, context?: string) => {
//   try {
//     const chatPrompt = `
//     You are answering questions about a research document. 
    
//     Question: ${question}
//     Document ID: ${documentId}
//     Context: ${context || "No additional context provided"}
    
//     Please provide:
//     1. A comprehensive answer to the question
//     2. A confidence score (0-1)
//     3. 2 relevant source citations with page numbers
    
//     Format your response as JSON:
//     {
//       "answer": "detailed answer string",
//       "confidence": number_between_0_and_1,
//       "sources": [
//         {"page": number, "text": "relevant citation text"}
//       ]
//     }
//     `

//     const result = await openai.chat.completions.create({
//       model: "openai/gpt-5-chat-latest",
//       messages: [
//         {
//           role: "system",
//           content:
//             "You are a research assistant expert who provides accurate, well-cited answers to questions about academic documents. Always respond with valid JSON.",
//         },
//         {
//           role: "user",
//           content: chatPrompt,
//         },
//       ],
//       temperature: 0.6,
//       max_tokens: 800,
//     })

//     const aiResponse = result.choices[0].message.content
//     const parsedResponse = JSON.parse(aiResponse)

//     return {
//       answer: parsedResponse.answer,
//       confidence: parsedResponse.confidence,
//       sources: parsedResponse.sources,
//     }
//   } catch (error) {
//     console.error("GPT-5 Chat Error:", error)
//     // Fallback response if AI fails
//     return {
//       answer:
//         "I apologize, but I'm currently unable to process your question due to a temporary AI service issue. Please try again in a moment, or rephrase your question.",
//       confidence: 0.5,
//       sources: [{ page: 1, text: "AI service temporarily unavailable" }],
//     }
//   }
// }

// export async function POST(request: NextRequest) {
//   try {
//     const body: ChatRequest = await request.json()

//     const response = await generateAnswer(body.question, body.documentId, body.context)

//     return NextResponse.json({
//       success: true,
//       ...response,
//     })
//   } catch (error) {
//     console.error("Chat error:", error)
//     return NextResponse.json({ success: false, error: "Failed to generate response" }, { status: 500 })
//   }
// }
