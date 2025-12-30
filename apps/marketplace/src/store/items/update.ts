import { prisma } from "@repo/database";
import { ProductDTO, ProductUpdatePayload } from "@repo/shared-types";
import { marketplaceProductSelect } from "./get";

export async function updateItem(
  itemId: string,
  data: ProductUpdatePayload
): Promise<ProductDTO> {
  return await prisma.product.update({
    where: { id: itemId },
    data,
    select: marketplaceProductSelect,
  });
}

export async function increaseViews(itemId: string): Promise<boolean> {
  await prisma.product.update({
    where: { id: itemId },
    data: { views: { increment: 1 } },
  });
  return true;
}

export async function markAsSold(itemId: string): Promise<boolean> {
  await prisma.product.update({
    where: { id: itemId },
    data: { status: "sold", soldAt: new Date() },
  });
  return true;
}
