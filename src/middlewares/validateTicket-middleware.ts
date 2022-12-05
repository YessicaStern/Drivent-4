import bookingsService from "@/services/bookings-service";
import { NextFunction, Response } from "express";
import httpStatus from "http-status";
import { AuthenticatedRequest } from "./authentication-middleware";

export async function validateTicket(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { userId }=req;
  try {
    const enrollment = await bookingsService.getEnrollmentByUserId(userId);
    if(!enrollment) {
      return res.sendStatus(httpStatus.FORBIDDEN);
    }
    const tickets = await bookingsService.getTicketsByEnrollmentId(enrollment.id);
    if(!tickets[0]) {
      return res.sendStatus(httpStatus.FORBIDDEN);
    }
    const ticketsPaid = tickets.filter((e) => {
      if(e.status==="PAID" && !e.TicketType.isRemote && e.TicketType.includesHotel) {
        return e;
      }
    });
    if(!ticketsPaid[0]) {
      return res.sendStatus(httpStatus.FORBIDDEN);
    }
    next();
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).send(error.message);
  }
}

export async function validateAndLimitRoom(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { roomId } = req.body;
  if(!roomId) {
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }
  if(isNaN(roomId)) {
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }
  try {
    const room = await bookingsService.getRoom(roomId);
      
    if(!room) {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    const reserveRoom= await bookingsService.getbookingByRoomId(roomId);
    if(reserveRoom.length>=Number(room.capacity)) {
      return res.sendStatus(httpStatus.FORBIDDEN);
    }
    next();
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).send(error.message);
  }
}
