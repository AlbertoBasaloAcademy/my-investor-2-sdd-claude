package dev.aiddbot.abjavareact.bookings;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import dev.aiddbot.abjavareact.launches.Launch;
import dev.aiddbot.abjavareact.launches.LaunchRepository;
import dev.aiddbot.abjavareact.rockets.Rocket;
import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

  @Mock
  private BookingRepository bookingRepository;

  @Mock
  private LaunchRepository launchRepository;

  private BookingService service;

  private Launch launch;

  @BeforeEach
  void setUp() {
    service = new BookingService(bookingRepository, launchRepository);
    Rocket rocket = new Rocket("rocket-1", "Falcon 9", 5, "Earth");
    launch = new Launch(rocket, LocalDateTime.now().plusDays(1), 100.0, 3);
  }

  @Test
  void createsBookingWithValidData() {
    given(launchRepository.findById("launch-1")).willReturn(Optional.of(launch));
    given(bookingRepository.save(any(Booking.class)))
        .willAnswer(invocation -> invocation.getArgument(0));

    BookingResponse response = service.createBooking(
        "launch-1", new BookingRequest("Ada Lovelace", "ada@example.com", "+34600111222"));

    assertThat(response.passengerName()).isEqualTo("Ada Lovelace");
    assertThat(response.passengerEmail()).isEqualTo("ada@example.com");
    assertThat(response.passengerPhone()).isEqualTo("+34600111222");
    assertThat(response.status()).isEqualTo("created");
  }

  @Test
  void throwsWhenCreatingBookingForUnknownLaunch() {
    given(launchRepository.findById("unknown")).willReturn(Optional.empty());

    assertThatThrownBy(() -> service.createBooking(
        "unknown", new BookingRequest("Ada Lovelace", "ada@example.com", "+34600111222")))
        .isInstanceOf(NoSuchElementException.class)
        .hasMessageContaining("Launch not found");
  }

  @Test
  void returnsBookingsForLaunch() {
    Booking b1 = new Booking(launch, "Ada", "ada@example.com", "111");
    Booking b2 = new Booking(launch, "Grace", "grace@example.com", "222");
    given(bookingRepository.findByLaunchId("launch-1")).willReturn(List.of(b1, b2));

    List<BookingResponse> responses = service.getBookingsByLaunch("launch-1");

    assertThat(responses).hasSize(2);
    assertThat(responses.get(0).passengerName()).isEqualTo("Ada");
    assertThat(responses.get(1).passengerName()).isEqualTo("Grace");
  }

  @Test
  void throwsWhenBookingNotFoundById() {
    given(bookingRepository.findById("unknown")).willReturn(Optional.empty());

    assertThatThrownBy(() -> service.getBookingById("unknown"))
        .isInstanceOf(NoSuchElementException.class)
        .hasMessageContaining("Booking not found");
  }

  @Test
  void cancelsCreatedBooking() {
    Booking booking = new Booking(launch, "Ada", "ada@example.com", "111");
    given(bookingRepository.findById("booking-1")).willReturn(Optional.of(booking));
    given(bookingRepository.save(any(Booking.class)))
        .willAnswer(invocation -> invocation.getArgument(0));

    BookingResponse response = service.cancelBooking("booking-1");

    assertThat(response.status()).isEqualTo("cancelled");
  }

  @Test
  void throwsWhenCancellingAlreadyCancelledBooking() {
    Booking booking = new Booking(launch, "Ada", "ada@example.com", "111");
    booking.cancel();
    given(bookingRepository.findById("booking-1")).willReturn(Optional.of(booking));

    assertThatThrownBy(() -> service.cancelBooking("booking-1"))
        .isInstanceOf(IllegalStateException.class)
        .hasMessageContaining("already cancelled");
    verify(bookingRepository, never()).save(any(Booking.class));
  }

  @Test
  void throwsWhenCancellingUnknownBooking() {
    given(bookingRepository.findById("unknown")).willReturn(Optional.empty());

    assertThatThrownBy(() -> service.cancelBooking("unknown"))
        .isInstanceOf(NoSuchElementException.class)
        .hasMessageContaining("Booking not found");
  }
}
