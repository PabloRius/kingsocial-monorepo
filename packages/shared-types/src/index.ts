export interface ApiResponse<T> {
  success: true;
  data: T;
  error?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: Record<string, string>;
}

export * from "./profile";

export * from "./marketplace";

export * from "./chat";

export * from "./communities";
