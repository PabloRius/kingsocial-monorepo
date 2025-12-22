import type { UserDTO } from "@repo/shared-types";

export class User {
  constructor(
    public readonly id: string,
    public email: string,
    public createdAt: Date
  ) {}

  toDTO(): UserDTO {
    return {
      id: this.id,
      email: this.email,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
