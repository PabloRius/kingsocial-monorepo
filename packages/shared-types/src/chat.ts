import z from "zod";

export const messageSchema = z.object({
  id: z.string(),
  chatId: z.string(),
  content: z.string(),
  senderId: z.string(),
  createdAt: z.string(),
  productRef: z
    .object({
      id: z.string(),
      name: z.string(),
      photos: z.array(z.string()),
      price: z.number(),
    })
    .optional(),
  eventRef: z
    .object({
      id: z.string(),
      title: z.string(),
      date: z.date(),
      start_time: z.string(),
      location_format: z.string(),
      location: z.string().nullable(),
      all_day: z.boolean(),
      community: z.object({
        id: z.string(),
        name: z.string(),
      }),
    })
    .optional(),
});

export type MessageDTO = z.infer<typeof messageSchema>;

export const chatSchema = z.object({
  id: z.string(),
  messages: z.array(messageSchema),
  participants: z.array(
    z.object({
      id: z.string(),
      chatId: z.string(),
      userId: z.string(),
      lastReadAt: z.date(),
      user: z
        .object({ id: z.string(), image: z.string(), name: z.string() })
        .nullable(),
    })
  ),
});

export type ChatDTO = z.infer<typeof chatSchema>;
