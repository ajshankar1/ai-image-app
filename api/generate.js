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

    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${process.env.REPLICATE_API_KEY}`,
      },
      body: JSON.stringify({
        version: "e2e3f51e1b88dfcd9c7eae48eb2e5df0f4d0d41b57e8d9d9b5c2f0b9ba02e4c9",

        input: {
          prompt: finalPrompt,
          image: image,
          strength: 0.65
        }
      }),
    });

    const result = await response.json();

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
    return new Response(JSON.stringify({ error: "Server error", details: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
