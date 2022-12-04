import { prisma } from "@/config";

async function getbookingByUserIdRepository(userId: number) {
  return prisma.booking.findMany({ 
    where: { userId },
    include: { Room: true }
  });
}

async function getEnrollmentByUserIdRepository(userId: number) {
  return prisma.enrollment.findUnique({ where: { userId } });
}

async function getTicketsByEnrollmentIdRepository(enrollmentId: number) {
  return prisma.ticket.findMany({
    where: { enrollmentId },
    include: { TicketType: true }
  });
}

async function postBookingByUserIdAndRoomIdRepository(userId: number, roomId: number) {
  return prisma.booking.create({
    data: {
      roomId,
      userId
    }
  });
}
  
async function getRoomRepository(id: number) {
  return prisma.room.findUnique({ where: { id } });
}

async function getbookingByRoomIdRepository(roomId: number) {
  return prisma.booking.findMany({ where: { roomId } });
}

async function getBookingByIdRepository(id: number) {
  return prisma.booking.findUnique({ where: { id } });
}

async function putBookingByUserIdAndRoomIdRepository(id: number, userId: number, roomId: number) {
  return prisma.booking.updateMany({
    where: {
      userId,
      id
    },
    data: { roomId }
  });
}

const bookingsRepository = {
  getbookingByUserIdRepository,
  getEnrollmentByUserIdRepository,
  getTicketsByEnrollmentIdRepository,
  postBookingByUserIdAndRoomIdRepository,
  getRoomRepository,
  getbookingByRoomIdRepository,
  getBookingByIdRepository,
  putBookingByUserIdAndRoomIdRepository
};
  
export default bookingsRepository;
  
