"use server";
import { ApiResponse, MarketplaceResponse } from "@repo/shared-types";

const baseURL = `${process.env.NEXT_PUBLIC_MARKETPLACE_URL}`;

export async function getMarketplaceStore() {
  const response = await fetch(`${baseURL}/items`);

  if (!response.ok) {
    throw new Error("Failed to fetch marketplace data");
  }

  const result: ApiResponse<MarketplaceResponse> = await response.json();

  return result;
}
