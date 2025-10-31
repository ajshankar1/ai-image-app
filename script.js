async function generateImage() {
  const fileInput = document.getElementById("imageInput");
  const promptInput = document.getElementById("promptInput").value;
  const style = document.getElementById("styleSelect").value;
  const outputDiv = document.getElementById("output");

  outputDiv.innerHTML = "<p>Generating... please wait.</p>";

  if (!fileInput.files.length) {
    outputDiv.innerHTML = "<p style='color:red;'>Please upload an image first.</p>";
    return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onloadend = async () => {
    const base64Image = reader.result.split(",")[1];

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: base64Image,
          prompt: promptInput,
          style: style,
        }),
      });

      const data = await response.json();

      if (data.output) {
        outputDiv.innerHTML = `<img src="${data.output}" />`;
      } else {
        outputDiv.innerHTML = "<p style='color:red;'>Failed to generate image.</p>";
      }
    } catch (error) {
      outputDiv.innerHTML = "<p style='color:red;'>Error: Unable to reach server.</p>";
    }
  };

  reader.readAsDataURL(file);
}
