import { prisma } from "@repo/database";
import { ProductDTO } from "@repo/shared-types";
import { marketplaceProductSelect } from "./get";

export async function deleteItem(itemId: string): Promise<ProductDTO> {
  return await prisma.product.delete({
    where: { id: itemId },
    select: marketplaceProductSelect,
  });
}
