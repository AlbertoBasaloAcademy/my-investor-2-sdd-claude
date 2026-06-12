package dev.aiddbot.abjavareact.bookings;

import jakarta.validation.constraints.NotBlank;

public record BookingRequest(
    @NotBlank(message = "Passenger name is required") String passengerName,
    @NotBlank(message = "Passenger email is required") String passengerEmail,
    @NotBlank(message = "Passenger phone is required") String passengerPhone
) {
}
