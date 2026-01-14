import * as EventsService from "../src/services/events.service";
import * as CommunitiesStore from "../src/store/communities";
import * as EventsStore from "../src/store/events";

jest.mock("../src/store/events");
jest.mock("../src/store/communities");

jest.mock("@repo/database", () => ({
  prisma: {
    user: { findUnique: jest.fn() },
    community: { findUnique: jest.fn() },
    event: { findUnique: jest.fn() },
  },
}));

describe("Events Component Unit Tests", () => {
  const mockUserId = "u1";
  const mockEventId = "e1";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // TC-UNIT-SOC-06
  it("should throw 403 if non-admin trues to create an event", async () => {
    (CommunitiesStore.getMemberByUserId as jest.Mock).mockResolvedValue({
      role: "member",
    });

    await expect(
      EventsService.createEvent({} as any, "c1", mockUserId)
    ).rejects.toThrow("Only admins of a community can create new events");
  });

  // TC-UNIT-SOC-07
  it("should throw 400 if user is already a participant", async () => {
    (EventsStore.getById as jest.Mock).mockResolvedValue({
      participants: [{ userId: mockUserId }],
    });

    await expect(
      EventsService.joinEvent(mockEventId, mockUserId)
    ).rejects.toThrow("User is already a participant in this event");
  });

  // TC-UNIT-SOC-08
  it("should thow 403 if non-admin tries to delet event", async () => {
    (EventsStore.getById as jest.Mock).mockResolvedValue({
      creatorId: "other",
      participants: [{ userId: mockUserId, role: "member" }],
    });

    await expect(
      EventsService.deleteEventById(mockEventId, mockUserId)
    ).rejects.toThrow("Only the admins can delete the event");
  });

  // TC-UNIT-SOC-09
  it("should return null if eventId doesn't exist", async () => {
    (EventsStore.getById as jest.Mock).mockResolvedValue(null);
    const result = await EventsService.getEventById("missing");
    expect(result).toBeNull();
  });
});
