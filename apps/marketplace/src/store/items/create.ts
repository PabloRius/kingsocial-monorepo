import { prisma } from "@repo/database";
import { ProductCreatePayload, ProductDTO } from "@repo/shared-types";
import { marketplaceProductSelect } from "./get";

export async function createItem(
  sellerId: string,
  data: ProductCreatePayload
): Promise<ProductDTO> {
  return await prisma.product.create({
    data: {
      ...data,
      seller: { connect: { id: sellerId } },
      status: "active",
    },
    select: marketplaceProductSelect,
  });
}
