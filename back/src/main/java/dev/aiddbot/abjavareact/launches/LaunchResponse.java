package dev.aiddbot.abjavareact.launches;

public record LaunchResponse(
    String id,
    String rocketId,
    String rocketName,
    String scheduledAt,
    double pricePerTicket,
    int minimumOccupancy,
    String status
) {
}
