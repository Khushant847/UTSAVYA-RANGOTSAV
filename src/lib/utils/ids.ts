import { customAlphabet } from "nanoid";

const bookingAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const ticketAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const nanoidBooking = customAlphabet(bookingAlphabet, 6);
const nanoidTicket = customAlphabet(ticketAlphabet, 8);

export function generateBookingId(): string {
  return `UTS26-${nanoidBooking()}`;
}

export function generateTicketId(): string {
  return `UV26-${nanoidTicket()}`;
}

export function generateQRToken(): string {
  return crypto.randomUUID();
}
