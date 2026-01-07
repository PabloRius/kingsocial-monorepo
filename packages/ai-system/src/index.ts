import { InferenceClient } from "@huggingface/inference";

const client = new InferenceClient(process.env.HF_TOKEN);

const getClient = () => {
  const token = process.env.HF_TOKEN;
  if (!token) {
    throw new Error("@repo/ai-system: HF_TOKEN is missing in the environment.");
  }
  return new InferenceClient(token);
};

export async function generateVector(text: string): Promise<number[]> {
  try {
    const hf = getClient();

    // Use featureExtraction with the specific model
    const result = await hf.featureExtraction({
      model: "sentence-transformers/all-MiniLM-L6-v2",
      inputs: text,
    });

    // Handle potential nested array from the API
    const vector = Array.isArray(result[0])
      ? (result[0] as number[])
      : (result as number[]);

    return vector;
  } catch (error: any) {
    // Log specifically if it's an auth error
    if (error.httpResponse?.status === 401) {
      console.error(
        "❌ Hugging Face Auth Failed: Check if HF_TOKEN is valid in your .env"
      );
    } else {
      console.error("Hugging Face Inference Error:", error);
    }
    return [];
  }
}
