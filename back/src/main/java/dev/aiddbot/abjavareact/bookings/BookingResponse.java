package dev.aiddbot.abjavareact.bookings;

public record BookingResponse(
    String id,
    String launchId,
    String passengerName,
    String passengerEmail,
    String passengerPhone,
    String status
) {
}
