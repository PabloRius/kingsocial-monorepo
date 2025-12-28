"use server";
import { auth } from "@/lib/auth";
import {
  ApiErrorResponse,
  ApiResponse,
  GetMarketplaceQuery,
  MarketplaceResponse,
  ProductCreatePayload,
  ProductDTO,
} from "@repo/shared-types";
import { deleteFromCloudinary, uploadToCloudinary } from "./cloudinary-utils";

const baseURL = `${process.env.NEXT_PUBLIC_MARKETPLACE_URL}`;

export async function getMarketplaceStore(filters?: GetMarketplaceQuery) {
  const url = new URL(`${baseURL}/items`);
  const session = await auth();
  if (session) url.searchParams.append("userId", session.user.id);

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error("Failed to fetch marketplace data");
  }

  const result: ApiResponse<MarketplaceResponse> = await response.json();

  return result;
}

export async function getItemById(itemId: string) {
  const url = new URL(`${baseURL}/items/${itemId}`);
  const response = await fetch(url.toString());
  if (!response.ok) {
    console.error("Error fetching item: ", response);
    throw new Error("Failed to fetch item data");
  }

  const result: ApiResponse<ProductDTO> = await response.json();

  return result;
}

export async function getOwnMarketplaceStore() {
  const url = new URL(`${baseURL}/items/me`);

  const session = await auth();

  if (!session?.sessionToken) {
    throw new Error("Unauthorised: No session token found");
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${session.sessionToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    console.error("Error fetching item: ", response);
    throw new Error("Failed to fetch item data");
  }

  const result: ApiResponse<ProductDTO[]> = await response.json();

  return result;
}

export async function createItem(
  data: ProductCreatePayload,
  files: Array<File>
) {
  let uploadedUrls: string[] = [];
  try {
    const url = new URL(`${baseURL}/items`);

    const session = await auth();

    if (!session?.sessionToken) {
      throw new Error("Unauthorised: No session token found");
    }

    uploadedUrls = await Promise.all(
      files.map((file) => uploadToCloudinary(file, "marketplace"))
    );

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.sessionToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...data, photos: uploadedUrls }),
    });

    if (!response.ok) {
      const errorResult: ApiErrorResponse = await response
        .json()
        .catch(() => ({}));
      console.error("Error creating item: ", errorResult);
      if (uploadedUrls.length > 0) {
        try {
          await Promise.all(
            uploadedUrls.map((url) => deleteFromCloudinary(url, "marketplace"))
          );
        } catch (cleanupError) {
          console.error("Cleanup failed: ", cleanupError);
        }
      }
      return errorResult;
    }

    const result: ApiResponse<ProductDTO> = await response.json();

    return result;
  } catch (error) {
    if (uploadedUrls.length > 0) {
      try {
        await Promise.all(
          uploadedUrls.map((url) => deleteFromCloudinary(url, "marketplace"))
        );
      } catch (cleanupError) {
        console.error("Cleanup failed: ", cleanupError);
      }
    }
    throw error;
  }
}

export async function modifyItem(
  itemId: string,
  data: ProductCreatePayload,
  files: Array<File>,
  initialPhotos: string[]
) {
  let uploadedUrls: string[] = [];
  try {
    const url = new URL(`${baseURL}/items/${itemId}`);

    const session = await auth();

    if (!session?.sessionToken) {
      throw new Error("Unauthorised: No session token found");
    }

    const removedPhotos = initialPhotos.filter(
      (url) => !data.photos.includes(url)
    );

    uploadedUrls = await Promise.all(
      files.map((file) => uploadToCloudinary(file, "marketplace"))
    );

    const response = await fetch(url.toString(), {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${session.sessionToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...data,
        photos: [...data.photos, ...uploadedUrls],
      }),
    });

    if (!response.ok) {
      const errorResult: ApiErrorResponse = await response
        .json()
        .catch(() => ({}));
      console.error("Error modifying item: ", errorResult);
      if (uploadedUrls.length > 0) {
        try {
          await Promise.all(
            uploadedUrls.map((url) => deleteFromCloudinary(url, "marketplace"))
          );
        } catch (cleanupError) {
          console.error("Cleanup failed: ", cleanupError);
        }
      }
      return errorResult;
    }

    if (removedPhotos.length > 0) {
      await Promise.all(
        removedPhotos.map((url) => deleteFromCloudinary(url, "marketplace"))
      );
    }

    const result: ApiResponse<ProductDTO> = await response.json();

    return result;
  } catch (error) {
    if (uploadedUrls.length > 0) {
      try {
        await Promise.all(
          uploadedUrls.map((url) => deleteFromCloudinary(url, "marketplace"))
        );
      } catch (cleanupError) {
        console.error("Cleanup failed: ", cleanupError);
      }
    }
    throw error;
  }
}

export async function markItemAsSold(itemId: string) {
  const url = new URL(`${baseURL}/items/sold/:${itemId}`);

  const session = await auth();

  if (!session?.sessionToken) {
    throw new Error("Unauthorised: No session token found");
  }

  const response = await fetch(url.toString(), {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${session.sessionToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ itemId }),
  });

  if (!response.ok) {
    console.error("Error updating item: ", response);
    throw new Error("Failed to update item");
  }

  const result: ApiResponse<ProductDTO> = await response.json();

  return result;
} //TODO: Implement in backend

export async function toggleBookmark(itemId: string) {
  const url = new URL(`${baseURL}/items/bookmark/${itemId}`);

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error("Failed to fetch bookmarking service");
  }

  const result: ApiResponse<MarketplaceResponse> = await response.json();

  return result;
} //TODO: Implement in backend

export async function increaseViews(itemId: string) {
  const url = new URL(`${baseURL}/items/increase_views/${itemId}`);

  const session = await auth();

  if (!session?.sessionToken) {
    throw new Error("Unauthorised: No session token found");
  }

  const response = await fetch(url.toString(), {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${session.sessionToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to update item");
  }

  const result: ApiResponse<null> = await response.json();

  return result;
}

export async function deleteItemById(itemId: string) {
  const url = new URL(`${baseURL}/items/${itemId}`);

  const session = await auth();

  if (!session?.sessionToken) {
    throw new Error("Unauthorised: No session token found");
  }

  const response = await fetch(url.toString(), {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${session.sessionToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ itemId }),
  });

  if (!response.ok) {
    console.error("Error delete item: ", response);
    throw new Error("Failed to delete item");
  }

  const result: ApiResponse<ProductDTO> = await response.json();

  if (result.data.photos && result.data.photos.length > 0) {
    result.data.photos.forEach((photo) => {
      deleteFromCloudinary(photo, "marketplace");
    });
  }

  return result;
}

export async function activatePlan(id: string) {
  const url = new URL(`${baseURL}/plans/register`);

  url.searchParams.append("id", id);

  const response = await fetch(url.toString(), { method: "POST" });

  if (!response.ok) {
    throw new Error("Failed to select a plan");
  }

  const result: ApiResponse<null> = await response.json();

  return result;
}
