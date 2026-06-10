package dev.aiddbot.abjavareact.launches;

public record LaunchRequest(
    String rocketId,
    String scheduledAt,
    Double pricePerTicket,
    Integer minimumOccupancy
) {
}
