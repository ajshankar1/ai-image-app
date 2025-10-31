export default async function handler(req, res) {
  try {
    const { image, prompt, style } = req.body;

    const stylePrompt = {
      realistic: "hyper-realistic, detailed lighting, natural skin texture",
      cinematic: "cinematic lighting, dramatic shadows, film-grade detail",
      anime: "clean anime style, vibrant colors, smooth shading",
      watercolor: "soft watercolor painting, blended edges, artistic texture",
      "oil painting": "oil painting style, textured brush strokes, classic art look",
    };

    const finalPrompt = `${prompt}, ${stylePrompt[style]}`;

    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${process.env.REPLICATE_API_KEY}`,
      },
      body: JSON.stringify({
        version: "5c7d927d6c4a45c265680b5b5e3b300f68e5f1f898a79056ba8188b5bfe0f733",
        input: {
          prompt: finalPrompt,
          image: image,
          strength: 0.65,
        },
      }),
    });

    const result = await response.json();

    if (result?.output && result.output[0]) {
      res.status(200).json({ output: result.output[0] });
    } else {
      res.status(500).json({ error: "Generation failed", details: result });
    }
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
}

export const config = {
  runtime: "edge",
};
