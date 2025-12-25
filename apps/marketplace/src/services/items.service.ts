import { GetMarketplaceQuery } from "@repo/shared-types";
import * as ItemStore from "../store/items";

export async function getMarketplaceCatalog(query: GetMarketplaceQuery) {
  const { page, limit, userId, ...filters } = query;

  const data = await ItemStore.getAll(page, limit, userId, filters);

  if (!data) throw new Error("DATABASE_ERROR");

  return data;
}
