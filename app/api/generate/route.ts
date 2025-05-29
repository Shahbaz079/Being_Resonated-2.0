import { NextRequest, NextResponse } from "next/server";
import { extractTextFromPdfBuffer} from "@/lib/pdfParser";
import Together from "together-ai";



export async function POST(req: NextRequest) {
 const body = await req.json();

 try {
    
    const { fileId, prompt } = body;

    if (!fileId || !prompt) {
      return NextResponse.json({ error: "Missing fileId or prompt" }, { status: 400 });
    }

    // Step 1: Download the PDF from Google Drive
    const pdfUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    const response = await fetch(pdfUrl);

    console.log("response",response)

   
    
    if (!response.ok) throw new Error("Failed to download PDF");

    const buffer = await response.arrayBuffer();
    if (!buffer) {
      return NextResponse.json({ error: "Failed to download PDF content." }, { status: 500 });
    }

    console.log("PDF buffer size:", buffer.byteLength); // Log the size of the PDF buffer for debugging

  

let document = "";

try {
  document = await extractTextFromPdfBuffer(new Uint8Array(buffer));

  
} catch (err) {
  console.error("Failed to parse PDF buffer:", err);
  return NextResponse.json({ error: "PDF parsing failed" }, { status: 500 });
}


   
    // Step 3: Call Together.ai chat completion
    const together = new Together({ apiKey: process.env.TOGETHER_API_KEY }); // optional: pass apiKey here
    const chatResponse = await together.chat.completions.create({
      model: "mistralai/Mistral-7B-Instruct-v0.3",
      messages: [
        { role: "system", content: "You are a helpful assistant that uses context." },
        { role: "user", content: `Here is some context:\n\n${document}\n\nMy question: ${prompt}` },
      ],
    });

    if (!chatResponse.created || !chatResponse.choices?.[0]?.message?.content) {
      return NextResponse.json({ error: "No content returned from Together AI API." }, { status: 500 });
    }

   
    console.log(chatResponse.choices[0].message.content )

    return NextResponse.json({ reply: chatResponse.choices[0].message.content }, { status: 200 });

  } catch (error: any) {
    console.error("Error in PDF chat:", error);
    return NextResponse.json({ error: "Failed to process PDF chat." }, { status: 500 });
  }        
   
}
