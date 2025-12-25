import { GetMarketplaceQuery } from "@repo/shared-types";
import * as ItemStore from "../store/items";

export async function getMarketplaceCatalog(query: GetMarketplaceQuery) {
  const { page, limit, userId, ...filters } = query;

  const data = await ItemStore.getAll(page, limit, userId, filters);

  if (!data) throw new Error("DATABASE_ERROR");

  return data;
}

export async function getItemById(id: string) {
  const item = await ItemStore.getById(id);
  if (!item) throw new Error("Item not found");
  return item;
}

export async function getUserInventory(userId: string) {
  return await ItemStore.getByUserId(userId);
}
