package dev.aiddbot.abjavareact.bookings;

import dev.aiddbot.abjavareact.launches.Launch;
import dev.aiddbot.abjavareact.launches.LaunchRepository;
import java.util.List;
import java.util.NoSuchElementException;
import org.springframework.stereotype.Service;

@Service
public class BookingService {

  private final BookingRepository bookingRepository;
  private final LaunchRepository launchRepository;

  public BookingService(BookingRepository bookingRepository, LaunchRepository launchRepository) {
    this.bookingRepository = bookingRepository;
    this.launchRepository = launchRepository;
  }

  public BookingResponse createBooking(String launchId, BookingRequest request) {
    Launch launch = launchRepository.findById(launchId)
        .orElseThrow(() -> new NoSuchElementException("Launch not found: " + launchId));
    Booking booking = new Booking(launch, request.passengerName(), request.passengerEmail(), request.passengerPhone());
    return toResponse(bookingRepository.save(booking));
  }

  public List<BookingResponse> getBookingsByLaunch(String launchId) {
    return bookingRepository.findByLaunchId(launchId).stream().map(this::toResponse).toList();
  }

  public BookingResponse getBookingById(String id) {
    return bookingRepository.findById(id)
        .map(this::toResponse)
        .orElseThrow(() -> new NoSuchElementException("Booking not found: " + id));
  }

  public BookingResponse cancelBooking(String id) {
    Booking booking = bookingRepository.findById(id)
        .orElseThrow(() -> new NoSuchElementException("Booking not found: " + id));
    if (booking.getStatus() == BookingStatus.CANCELLED) {
      throw new IllegalStateException("Booking is already cancelled: " + id);
    }
    booking.cancel();
    return toResponse(bookingRepository.save(booking));
  }

  private BookingResponse toResponse(Booking booking) {
    return new BookingResponse(
        booking.getId(),
        booking.getLaunch().getId(),
        booking.getPassengerName(),
        booking.getPassengerEmail(),
        booking.getPassengerPhone(),
        booking.getStatus().name().toLowerCase());
  }
}
