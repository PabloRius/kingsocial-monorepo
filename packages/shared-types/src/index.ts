export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export * from "./profile";

export * from "./marketplace";
