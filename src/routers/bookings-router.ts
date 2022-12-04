import { Router } from "express";
import { authenticateToken, validateAndLimitRoom, validateTicket } from "@/middlewares";
import { getBookings, postBookings, putBookings } from "@/controllers/bookings-controller";

const bookingsRouter = Router();

bookingsRouter
  .all("/*", authenticateToken)
  .get("/", getBookings)
  .post("/", validateTicket, validateAndLimitRoom, postBookings)
  .post("/:bookingId", validateTicket, validateAndLimitRoom, putBookings);

export { bookingsRouter };
