"use client"

import { useState } from "react"

export default function Home(){

const [idea,setIdea] = useState("")
const [startup,setStartup] = useState<any>(null)
const [website,setWebsite] = useState("")
const [loading,setLoading] = useState(false)
const [theme,setTheme] = useState("blue")

async function generateStartup(){

setLoading(true)

const res = await fetch("/api/generate",{
method:"POST",
headers:{ "Content-Type":"application/json" },
body:JSON.stringify({ idea })
})

const data = await res.json()

setStartup(data)
setLoading(false)

}

async function generateWebsite(){

setLoading(true)

const res = await fetch("/api/website",{
method:"POST",
headers:{ "Content-Type":"application/json" },
body:JSON.stringify({ startup })
})

const data = await res.json()

setWebsite(data.html)

setLoading(false)

setTimeout(()=>{
document
.getElementById("preview")
?.scrollIntoView({behavior:"smooth"})
},200)

}

function resetApp(){
setIdea("")
setStartup(null)
setWebsite("")
}

function copyHTML(){
navigator.clipboard.writeText(website)
alert("HTML copied")
}

return(

<div className={`container ${theme}`}>

{/* SIDEBAR */}

<div className="sidebar">

<h2>VyapaarAI</h2>

<button onClick={resetApp}>New Startup</button>

<button
onClick={()=>alert("Future feature: Logo Generator")}
>
Generate Logo
</button>

<button
onClick={()=>alert("Future feature: Marketing Plan")}
>
Marketing Plan
</button>

<button
onClick={()=>alert("Future feature: Pitch Deck")}
>
Pitch Deck
</button>

</div>


{/* MAIN AREA */}

<div className="main">

<h1 className="title">Turn Any Idea Into a Startup</h1>

<div className="inputCard">

<input
value={idea}
onChange={e=>setIdea(e.target.value)}
placeholder="Enter startup idea"
/>

<button onClick={generateStartup}>
{loading ? "Generating..." : "Generate Business"}
</button>

</div>


{startup && (

<div className="startupCard">

<h2>{startup.business_name}</h2>

<h4>{startup.tagline}</h4>

<p>{startup.description}</p>

<h3>Products</h3>

<div className="products">

{startup.products.map((p:string,i:number)=>(
<div key={i} className="product">
{p}
</div>
))}

</div>

<div className="buttons">

<button onClick={generateWebsite}>
Generate Website
</button>

<button onClick={resetApp}>
Start Over
</button>

</div>

</div>

)}


{website && (

<div id="preview" className="previewSection">

<h2>Website Preview</h2>


{/* PREVIEW CONTROLS */}

<div className="previewControls">

<button onClick={generateWebsite}>
Regenerate
</button>

<button onClick={copyHTML}>
Copy HTML
</button>

<a
href={`data:text/html;charset=utf-8,${encodeURIComponent(website)}`}
download="website.html"
>
<button>
Download
</button>
</a>

<select
onChange={(e)=>setTheme(e.target.value)}
>

<option value="blue">Blue Theme</option>
<option value="purple">Purple Theme</option>
<option value="dark">Dark Theme</option>

</select>

</div>


<div className="previewBox">

<iframe srcDoc={website}></iframe>

</div>

</div>

)}

</div>


<style jsx>{`

.container{
display:flex;
min-height:100vh;
font-family:system-ui;
}

.blue{
background:linear-gradient(135deg,#0f172a,#1e3a8a);
}

.purple{
background:linear-gradient(135deg,#2e1065,#7c3aed);
}

.dark{
background:#020617;
}

/* SIDEBAR */

.sidebar{
width:220px;
background:#0f172a;
padding:30px;
display:flex;
flex-direction:column;
gap:15px;
color:white;
}

.sidebar button{
padding:10px;
border:none;
border-radius:6px;
background:#1e293b;
color:white;
cursor:pointer;
}

/* MAIN */

.main{
flex:1;
padding:60px;
color:white;
}

.title{
text-align:center;
margin-bottom:40px;
}

/* INPUT */

.inputCard{
display:flex;
gap:10px;
justify-content:center;
margin-bottom:30px;
}

input{
padding:12px;
border-radius:8px;
border:none;
width:280px;
}

button{
padding:12px 18px;
border:none;
border-radius:8px;
background:#3b82f6;
color:white;
cursor:pointer;
}

/* STARTUP CARD */

.startupCard{
background:white;
color:black;
max-width:700px;
margin:auto;
padding:30px;
border-radius:12px;
}

.products{
display:flex;
gap:10px;
flex-wrap:wrap;
margin-top:10px;
}

.product{
background:#e2e8f0;
padding:8px 12px;
border-radius:6px;
}

.buttons{
margin-top:20px;
display:flex;
gap:10px;
}

/* PREVIEW */

.previewSection{
margin-top:60px;
text-align:center;
}

.previewControls{
margin-bottom:20px;
display:flex;
gap:10px;
justify-content:center;
flex-wrap:wrap;
}

.previewBox{
background:white;
border-radius:12px;
overflow:hidden;
box-shadow:0 10px 40px rgba(0,0,0,0.3);
}

iframe{
width:100%;
height:600px;
border:none;
}

`}</style>

</div>

)
}