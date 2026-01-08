import { InferenceClient } from "@huggingface/inference";
import { generateVector } from "..";

jest.mock("@huggingface/inference");

describe("AI System Unit Tests", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
    jest.clearAllMocks();
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it("should return a 384-length float array when given a valid text", async () => {
    const mockVector = new Array(384).fill(0.123);
    (InferenceClient as jest.Mock).mockImplementation(() => ({
      featureExtraction: jest.fn().mockResolvedValue(mockVector),
    }));

    process.env.HF_TOKEN = "valid_token";

    const result = await generateVector("This is a test string");

    expect(result).toHaveLength(384);
    expect(result[0]).toBe(0.123);
    expect(Array.isArray(result)).toBe(true);
  });

  it("should throw a 'missing token' error if HF_TOKEN is missing", async () => {
    delete process.env.HF_TOKEN;

    console.log(process.env);

    await expect(generateVector("This is a test string")).rejects.toThrow(
      "@repo/ai-system: HF_TOKEN is missing in the environment."
    );
  });
});
