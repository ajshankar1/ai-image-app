// api/generate.js  (Edge runtime - Fal.ai Img2Img)
export const config = { runtime: "edge" };

export default async function handler(req) {
  try {
    const body = await req.json();
    const { image, prompt, style } = body;

    // Optional style mapping
    const stylePrompt = {
      realistic: "hyper realistic, detailed lighting, natural skin texture",
      cinematic: "cinematic lighting, dramatic shadows, film look",
      anime: "clean anime style, bright colors",
      watercolor: "soft watercolor painting",
      "oil painting": "oil painting texture, brush strokes"
    };

    const finalPrompt = `${prompt || ""}, ${stylePrompt[style] || ""}`.trim();

    // Validate image from frontend
    if (!image || typeof image !== "string" || !image.startsWith("data:image/")) {
      return new Response(JSON.stringify({ 
        error: "Invalid image format. Send a full data URL (data:image/...)" 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Payload for Fal.ai
    const falBody = {
      prompt: finalPrompt || "photo realistic",
      init_image: image,
      strength: 0.6,
      n: 1,
      size: "1024x1024"
    };

    // ✅ Correct Fal.ai Img2Img endpoint
    const response = await fetch("https://api.fal.ai/fal-ai/flux-lora/Img2Img/run", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.FAL_API_KEY}`
      },
      body: JSON.stringify(falBody)
    });

    const result = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({
        error: "Fal API error",
        details: result
      }), {
        status: response.status,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Extract output URL or base64
    let outputUrl = null;

    if (result?.output && Array.isArray(result.output)) {
      const out = result.output[0];
      if (out.url) outputUrl = out.url;
      if (out.image) outputUrl = out.image;
      if (out.b64_json) {
        outputUrl = `data:image/png;base64,${out.b64_json}`;
      }
    }

    if (!outputUrl && result?.data && Array.isArray(result.data)) {
      const d0 = result.data[0];
      if (d0.url) outputUrl = d0.url;
      if (d0.b64) outputUrl = `data:image/png;base64,${d0.b64}`;
    }

    if (!outputUrl) {
      return new Response(JSON.stringify({
        error: "No image in Fal response",
        details: result
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ output: outputUrl }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({
      error: "Server error",
      details: err.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
