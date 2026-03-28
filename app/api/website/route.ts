import { NextResponse } from "next/server"

export async function POST(req: Request) {

try {

const body = await req.json()
const startup = body.startup

if(!startup){
return NextResponse.json({html:"<h1>No startup data</h1>"})
}

const prompt = `
Generate a modern startup landing page.

Startup Name: ${startup.business_name}
Tagline: ${startup.tagline}
Description: ${startup.description}

Products:
${startup.products.join(",")}

Return ONLY valid HTML.

Page must include:

Hero section
About section
Product cards
Features section
Testimonials
Call to action
Footer

Style rules:
modern
rounded cards
gradient hero
clean spacing
mobile friendly
inline CSS
`

const response = await fetch("https://api.x.ai/v1/chat/completions",{
method:"POST",
headers:{
"Content-Type":"application/json",
"Authorization":`Bearer ${process.env.GROK_API_KEY}`
},
body:JSON.stringify({
model:"grok-2-latest",
messages:[{role:"user",content:prompt}],
temperature:0.7
})
})

const data = await response.json()

let html = data?.choices?.[0]?.message?.content

if(!html || html.length < 50){

html = `
<html>
<body style="font-family:sans-serif;padding:40px">
<h1>Website Preview</h1>
<p>The AI response was empty. Click Generate Website again.</p>
</body>
</html>
`
}

html = html.replace(/```html/g,"").replace(/```/g,"")

return NextResponse.json({html})

}

catch(error){

return NextResponse.json({

html:`
<html>
<body style="font-family:sans-serif;padding:40px">
<h1>Website Preview</h1>
<p>AI generation failed temporarily. Try again.</p>
</body>
</html>
`

})

}

}