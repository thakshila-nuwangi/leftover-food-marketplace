import { Reservation } from './reservation.types';

export class InMemoryReservationRepository {
  private readonly reservations: Reservation[] = [];

  save(reservation: Reservation): Reservation {
    const index = this.reservations.findIndex((item) => item.id === reservation.id);
    if (index >= 0) this.reservations[index] = reservation;
    else this.reservations.push(reservation);
    return reservation;
  }

  findAll(): Reservation[] {
    return [...this.reservations];
  }

  findById(id: string): Reservation | undefined {
    return this.reservations.find((reservation) => reservation.id === id);
  }
}
