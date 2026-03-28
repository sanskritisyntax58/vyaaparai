import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: Request) {
  try {

    const { idea } = await req.json();

    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",

      messages: [
        {
          role: "system",
          content:
            "You generate startup ideas. Always respond ONLY with JSON.",
        },
        {
          role: "user",
          content: `Generate a startup idea for: ${idea}

Return JSON exactly like this:

{
 "business_name": "",
 "tagline": "",
 "description": "",
 "products": ["", "", ""]
}
`,
        },
      ],

      temperature: 0.7,
    });

    let text = completion.choices[0].message.content || "";

    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    const data = JSON.parse(text);

    return Response.json(data);

  } catch (error) {

    console.error(error);

    return Response.json({
      business_name: "Fallback Startup",
      tagline: "AI Response Failed",
      description:
        "The AI response could not be parsed, but the app is still working.",
      products: ["Product 1", "Product 2", "Product 3"],
    });
  }
}