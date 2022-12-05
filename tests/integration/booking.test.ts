import app, { init } from "@/app";
import faker from "@faker-js/faker";
import { TicketStatus } from "@prisma/client";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import supertest from "supertest";
import { createEnrollmentWithAddress, createUser, createTicketType, createTicket, createHotel, createRoomWithHotelId, createBooking, createTicketTypeWithHotel, createTicketTypeRemote, createTicketTypeNoHotel, createRoomWithHotelIdCapacityMin } from "../factories";
import { cleanDb, generateValidToken } from "../helpers";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe("GET /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/booking");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond 403 if no enrollment", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);
      expect(response.status).toEqual(403);
    });

    it("should respond 403 if enrollment and no ticket", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);

      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);
      expect(response.status).toEqual(403);
    });

    it("should respond 403 if enrollment and ticket PAID  but remote", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeRemote();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);
      expect(response.status).toEqual(403);
    });

    it("should respond 403 if enrollment and ticket PAID but ticket RESERVED", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);
      expect(response.status).toEqual(403);
    });

    it("should respond 403 if enrollment and ticket PAID but do not include hotel", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeNoHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);
      expect(response.status).toEqual(403);
    });

    it("should respond 404 when user doesn't have a booking", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);
      expect(response.status).toEqual(404);
    });

    it("should respond with status 200 and with existing Booking data", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const booking = await createBooking(user.id, room.id);

      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual([{
        id: booking.id,
        Room: {
          id: room.id,
          name: room.name,
          capacity: room.capacity,
          hotelId: room.hotelId,
          createdAt: room.createdAt.toISOString(),
          updatedAt: room.updatedAt.toISOString()
        }
      }]);
    });
  });
});

describe("POST /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.post("/booking");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond 403 if no enrollment", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);
      expect(response.status).toEqual(403);
    });

    it("should respond 403 if enrollment and no ticket", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);
      expect(response.status).toEqual(403);
    });

    it("should respond 403 if enrollment and ticket PAID  but remote", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeRemote();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);
      expect(response.status).toEqual(403);
    });

    it("should respond 403 if enrollment and ticket PAID but ticket RESERVED", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);
      expect(response.status).toEqual(403);
    });

    it("should respond 403 if enrollment and ticket PAID but do not include hotel", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeNoHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);
      expect(response.status).toEqual(403);
    });

    it("should respond 400 if no roomId", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      
      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);
      expect(response.status).toEqual(httpStatus.BAD_REQUEST);
    });

    it("should respond 400 if roomId is not a number", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const roomId="a";
      
      const response = (await server.post("/booking").set("Authorization", `Bearer ${token}`).send({ roomId }));
      expect(response.status).toEqual(httpStatus.BAD_REQUEST);
    });

    it("should respond 404 if roomId do not exist", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const roomId = (room.id + 1);
      
      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({ roomId });
      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it("should respond 403 capacity is exceeded", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      const room = await createRoomWithHotelIdCapacityMin(hotel.id);
      const roomId = room.id;
      const booking = await createBooking(user.id, roomId);
      
      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({ roomId });
      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it("should respond 200 if all data is correct", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const roomId = room.id;
      const booking = await createBooking(user.id, roomId);
      
      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({ roomId });
      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual({ id: booking.id+1 });
    });
  });
});

describe("POST /booking/:bookingId", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.post("/booking/1");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.post("/booking/1").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.post("/booking/1").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond 403 if no enrollment", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.post("/booking/1").set("Authorization", `Bearer ${token}`);
      expect(response.status).toEqual(403);
    });

    it("should respond 403 if enrollment and no ticket", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);

      const response = await server.post("/booking/1").set("Authorization", `Bearer ${token}`);
      expect(response.status).toEqual(403);
    });

    it("should respond 403 if enrollment and ticket PAID  but remote", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeRemote();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const response = await server.post("/booking/1").set("Authorization", `Bearer ${token}`);
      expect(response.status).toEqual(403);
    });

    it("should respond 403 if enrollment and ticket PAID but ticket RESERVED", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

      const response = await server.post("/booking/1").set("Authorization", `Bearer ${token}`);
      expect(response.status).toEqual(403);
    });

    it("should respond 403 if enrollment and ticket PAID but do not include hotel", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeNoHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const response = await server.post("/booking/1").set("Authorization", `Bearer ${token}`);
      expect(response.status).toEqual(403);
    });

    it("should respond 400 if no roomId", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      
      const response = await server.post("/booking/1").set("Authorization", `Bearer ${token}`);
      expect(response.status).toEqual(httpStatus.BAD_REQUEST);
    });

    it("should respond 400 if roomId is not a number", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const roomId="a";
      
      const response = (await server.post("/booking/1").set("Authorization", `Bearer ${token}`).send({ roomId }));
      expect(response.status).toEqual(httpStatus.BAD_REQUEST);
    });

    it("should respond 404 if roomId do not exist", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const roomId = (room.id + 1);
      
      const response = await server.post("/booking/1").set("Authorization", `Bearer ${token}`).send({ roomId });
      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it("should respond 403 capacity is exceeded", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      const room = await createRoomWithHotelIdCapacityMin(hotel.id);
      const roomId = room.id;
      const booking = await createBooking(user.id, roomId);
      
      const response = await server.post("/booking/1").set("Authorization", `Bearer ${token}`).send({ roomId });
      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it("should respond 400 if bookingId is not string", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const roomId = room.id;
      const booking = await createBooking(user.id, roomId);
      
      const response = await server.post("/booking/a").set("Authorization", `Bearer ${token}`).send({ roomId });
      expect(response.status).toEqual(httpStatus.BAD_REQUEST);
    });

    it("should respond 404 if bookingId does not exist", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const roomId = room.id;
      const booking = await createBooking(user.id, roomId);
      
      const response = await server.post("/booking/0").set("Authorization", `Bearer ${token}`).send({ roomId });
      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it("should respond 200 ", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const roomId = room.id;
      const booking = await createBooking(user.id, roomId);
      
      const response = await server.post(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send({ roomId });
      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual({ id: expect.any(Number) });
    });
  });
});

