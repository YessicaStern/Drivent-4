import { notFoundError } from "@/errors";
import bookingsRepository from "@/repositories/booking-repository";

async function getbookingByUserId(userId: number) {
  const booking = await bookingsRepository.getbookingByUserIdRepository(userId);
  const bookingInfo = booking.map((e) => {
    return {
      id: e.id,
      "Room": e.Room
    };
  });
  return bookingInfo;
}

async function getEnrollmentByUserId(userId: number) {
  return await bookingsRepository.getEnrollmentByUserIdRepository(userId);
}
  
async function getTicketsByEnrollmentId(enrollmentId: number) {
  return await bookingsRepository.getTicketsByEnrollmentIdRepository(enrollmentId);
}

async function postBookingByUserIdAndRoomId(userId: number, roomId: number) {
  const response = await bookingsRepository.postBookingByUserIdAndRoomIdRepository(userId, roomId);

  if (!response) {
    throw notFoundError();
  }
  return response;
}

async function getRoom(roomId: number) {
  return await bookingsRepository.getRoomRepository(roomId);
}

async function getbookingByRoomId(roomId: number) {
  return await bookingsRepository.getbookingByRoomIdRepository(roomId);
}

async function getBookingById(id: number) {
  return await bookingsRepository.getBookingByIdRepository(id);
}

async function putBookingByUserIdAndRoomId(bookingId: number, userId: number, roomId: number) {
  const response =  bookingsRepository.putBookingByUserIdAndRoomIdRepository(bookingId, userId, roomId);

  if (!response) {
    throw notFoundError();
  }
  return response;
}

const bookingsService = {
  getbookingByUserId,
  getEnrollmentByUserId,
  getTicketsByEnrollmentId,
  postBookingByUserIdAndRoomId,
  getRoom,
  getbookingByRoomId,
  getBookingById,
  putBookingByUserIdAndRoomId
};
  
export default bookingsService;
  
