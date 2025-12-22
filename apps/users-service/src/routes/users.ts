import { User } from "@repo/shared-models";
import { ApiResponse, UserDTO } from "@repo/shared-types";
import { Router } from "express";

const router: Router = Router();

router.get("/", (_req, res) => {
  const user = new User("1", "test@email.com", new Date());

  const response: ApiResponse<UserDTO[]> = {
    success: true,
    data: [user.toDTO()],
  };

  res.json(response);
});

export default router;
