import { NextRequest, NextResponse } from "next/server";
// @ts-ignore


import Together from "together-ai";
//import PdfParse from "pdf-parse";


export async function POST(req: NextRequest) {
 const { document, prompt } = await req.json();

 try {
    
 
    if (!document || !prompt) {
      return NextResponse.json({ error: "Missing context or prompt" }, { status: 400 });
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
