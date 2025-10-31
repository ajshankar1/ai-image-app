export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  try {
    const body = await req.json();
    const { image, prompt, style } = body;

    const stylePrompt = {
      realistic: "hyper realistic, detailed lighting, natural skin texture",
      cinematic: "cinematic lighting, dramatic shadows, film grade detail",
      anime: "clean anime style, vibrant colors, smooth shading",
      watercolor: "soft watercolor painting, blended edges, artistic texture",
      "oil painting": "oil painting style, textured brush strokes, classic art look"
    };

    const finalPrompt = `${prompt}, ${stylePrompt[style]}`;

    // Fetch from Replicate (using the correct version ID)
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${process.env.REPLICATE_API_KEY}`,
      },
      body: JSON.stringify({
        version: "610b3f3e8cd8ca39f1f5aa63fa53be15bbf241b7f0d5e4d8a5edff1ef7c7a0cf", // Updated, working model version
        input: {
          prompt: finalPrompt,
          init_image: image, // The uploaded image
          strength: 0.6 // Image strength for transformation
        }
      }),
    });

    const result = await response.json();

    // Return the generated image URL (or error if any)
    if (result?.output?.[0]) {
      return new Response(JSON.stringify({ output: result.output[0] }), {
        headers: { "Content-Type": "application/json" }
      });
    } else {
      return new Response(JSON.stringify({ error: "Generation failed", details: result }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

  } catch (error) {
    // Catch any server-side errors
    return new Response(JSON.stringify({ error: "Server error", details: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
