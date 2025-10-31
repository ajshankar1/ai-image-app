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

    const response = await fetch(
      "https://api.replicate.com/v1/models/stability-ai/sdxl/img2img",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${process.env.REPLICATE_API_KEY}`,
        },
        body: JSON.stringify({
          prompt: finalPrompt,
          image: image,
        }),
      }
    );

    const result = await response.json();

    if (result?.output?.[0]) {
      res.status(200).json({ output: result.output[0] });
    } else {
      res.status(500).json({ error: "Generation failed" });
    }
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
}
