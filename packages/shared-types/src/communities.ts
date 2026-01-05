import z from "zod";

export const eventParticipantSchema = z.object({
  id: z.string(),
  role: z.string(),
  allowsMassMessages: z.boolean(),
  eventId: z.string(),
  userId: z.string(),
  user: z.object({
    image: z.string().nullable(),
    name: z.string().nullable(),
  }),
});

export type EventParticipant = z.infer<typeof eventParticipantSchema>;

export const eventSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  coverImage: z.string(),
  tags: z.array(z.string()),
  public: z.boolean(),

  creatorId: z.string().nullable(),
  creator: z.object({ user: z.object({ id: z.string() }) }).nullable(),

  capacity: z.number().nullable(),
  participants: z.array(eventParticipantSchema),

  community: z.object({
    id: z.string(),
    name: z.string(),
    coverImage: z.string(),
    description: z.string(),
  }),

  location_format: z.string(),
  location: z.string().nullable(),

  date: z.date(),
  all_day: z.boolean(),
  start_time: z.string().nullable(),
  end_time: z.string().nullable(),
});

export type EventDTO = z.infer<typeof eventSchema>;

export const communityMessageSchema = z.object({
  id: z.string(),
  content: z.string(),
  createdAt: z.date(),
  communityId: z.string(),
  sender: z
    .object({
      role: z.string(),
      userId: z.string(),
      user: z.object({
        name: z.string().nullable(),
        image: z.string().nullable(),
      }),
    })
    .nullable(),
  senderId: z.string().nullable(),
});

export type CommunityMessage = z.infer<typeof communityMessageSchema>;

export const communityMemberSchema = z.object({
  id: z.string(),
  role: z.string(),
  userId: z.string(),
  user: z.object({
    name: z.string().nullable(),
    image: z.string().nullable(),
  }),
  communityId: z.string(),
  joinedAt: z.date(),
});

export type CommunityMember = z.infer<typeof communityMemberSchema>;

export const communityJoinRequestSchema = z.object({
  id: z.string(),
  user: z.object({
    id: z.string(),
    name: z.string().nullable(),
    image: z.string().nullable(),
  }),
  message: z.string().nullable(),
  createdAt: z.date(),
  status: z.string(),
});

export type CommunityJoinRequest = z.infer<typeof communityJoinRequestSchema>;

export const CommunityCoreModeEnum = z.enum(["public", "private"]);

export type CommunityMode = z.infer<typeof CommunityCoreModeEnum>;

export const communitySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  coverImage: z.string(),
  mode: z.string(),
  members: z.array(communityMemberSchema),
  joinRequests: z.array(communityJoinRequestSchema),
  chat: z.array(communityMessageSchema),
  events: z.array(eventSchema),
  createdAt: z.date(),
  creatorId: z.string(),
});

export type CommunityDTO = z.infer<typeof communitySchema>;

export const communityCreatePayloadSchema = z.object({
  body: z.object({
    name: z.string(),
    description: z.string(),
    coverImage: z.string(),
    mode: CommunityCoreModeEnum,
  }),
});

export type CommunityCreatePayload = z.infer<
  typeof communityCreatePayloadSchema
>["body"];
