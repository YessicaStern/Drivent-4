import { Response } from "express";
import { AuthenticatedRequest } from "@/middlewares";
import httpStatus from "http-status";
import bookingsService from "@/services/bookings-service";

export async function getBookings(req: AuthenticatedRequest, res: Response) {
  const { userId }=req;
  try {
    const booking = await bookingsService.getbookingByUserId(userId);
    if(booking.length===0) {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    return res.status(httpStatus.OK).send(booking);
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).send(error.message);
  }
}

export async function postBookings(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { roomId } = req.body;
  try {
    const createBooking = await bookingsService.postBookingByUserIdAndRoomId(userId, roomId);

    return res.status(httpStatus.OK).send({ id: createBooking.id });
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).send(error.message);
  }
}

export async function putBookings(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { roomId } = req.body;
  const { bookingId } =  req.params;

  const bookingNumber = Number(bookingId);

  if(!bookingId || isNaN(bookingNumber) ) {
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }
    
  try {
    const booking = await bookingsService.getBookingById(bookingNumber);
    if(!booking) {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    if(booking.userId!=userId) {
      return res.sendStatus(httpStatus.UNAUTHORIZED);
    }
        
    const updateBooking = await bookingsService.putBookingByUserIdAndRoomId(bookingNumber, userId, roomId);

    return res.status(httpStatus.OK).send(updateBooking);
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).send(error.message);
  }
}
