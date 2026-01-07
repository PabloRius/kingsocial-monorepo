import { generateVector } from "@repo/ai-system";
import { prisma } from "@repo/database";
import { ProductCreatePayload, ProductDTO } from "@repo/shared-types";
import { marketplaceProductSelect } from "./get";

export async function createItem(
  sellerId: string,
  data: ProductCreatePayload
): Promise<ProductDTO> {
  const embeddingText = `Product: ${data.name}. Category: ${
    data.category
  }. Condition: ${data.condition}. Description: ${
    data.description
  }. Tags: ${data.tags?.join(", ")}. Location: ${data.pickupLocation}.`
    .replace(/|s+/g, " ")
    .trim();
  const embedding = await generateVector(embeddingText);
  return await prisma.product.create({
    data: {
      ...data,
      seller: { connect: { id: sellerId } },
      status: "active",
      embedding: embedding,
    },
    select: marketplaceProductSelect,
  });
}
