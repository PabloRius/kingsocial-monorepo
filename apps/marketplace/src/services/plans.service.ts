import { Errors } from "@repo/backend-utils";
import { CreateSellerProfilePayload } from "@repo/shared-types";
import * as PlansStore from "../store/plans";

export async function registerAsSeller(
  userId: string,
  data: CreateSellerProfilePayload
) {
  const existingSeller = await PlansStore.getSellerProfile(userId);

  if (existingSeller) {
    throw new Errors.APIError("User is already registered as a seller", 400);
  }

  const result = await PlansStore.createSeller(userId, data);

  return result;
}
