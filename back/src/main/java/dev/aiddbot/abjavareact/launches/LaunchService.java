package dev.aiddbot.abjavareact.launches;

import dev.aiddbot.abjavareact.rockets.Rocket;
import dev.aiddbot.abjavareact.rockets.RocketRepository;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.NoSuchElementException;
import org.springframework.stereotype.Service;

@Service
public class LaunchService {

  private final LaunchRepository launchRepository;
  private final RocketRepository rocketRepository;

  public LaunchService(LaunchRepository launchRepository, RocketRepository rocketRepository) {
    this.launchRepository = launchRepository;
    this.rocketRepository = rocketRepository;
  }

  public LaunchResponse create(LaunchRequest request) {
    Rocket rocket = findActiveRocket(request.rocketId());
    LocalDateTime scheduledAt = parseScheduledAt(request.scheduledAt());
    validate(scheduledAt, request.pricePerTicket(), request.minimumOccupancy(), rocket.getCapacity());
    return toResponse(launchRepository.save(new Launch(rocket, scheduledAt, request.pricePerTicket(), request.minimumOccupancy())));
  }

  public List<LaunchResponse> findAll() {
    return launchRepository.findAllByOrderByScheduledAtDesc().stream().map(this::toResponse).toList();
  }

  public LaunchResponse findById(String id) {
    return launchRepository.findById(id)
        .map(this::toResponse)
        .orElseThrow(() -> new NoSuchElementException("Launch not found: " + id));
  }

  public LaunchResponse update(String id, LaunchRequest request) {
    Launch launch = launchRepository.findById(id)
        .orElseThrow(() -> new NoSuchElementException("Launch not found: " + id));
    if (launch.getStatus() != LaunchStatus.CREATED) {
      throw new IllegalStateException("Only launches in 'created' status can be edited");
    }
    LocalDateTime scheduledAt = parseScheduledAt(request.scheduledAt());
    validate(scheduledAt, request.pricePerTicket(), request.minimumOccupancy(), launch.getRocket().getCapacity());
    launch.update(scheduledAt, request.pricePerTicket(), request.minimumOccupancy());
    return toResponse(launchRepository.save(launch));
  }

  public LaunchResponse transition(String id, LaunchStatusRequest request) {
    Launch launch = launchRepository.findById(id)
        .orElseThrow(() -> new NoSuchElementException("Launch not found: " + id));
    LaunchStatus target = parseStatus(request.status());
    launch.transitionTo(target);
    return toResponse(launchRepository.save(launch));
  }

  private Rocket findActiveRocket(String rocketId) {
    Rocket rocket = rocketRepository.findById(rocketId)
        .orElseThrow(() -> new NoSuchElementException("Rocket not found: " + rocketId));
    if (rocket.isDecommissioned()) {
      throw new IllegalArgumentException("Rocket is decommissioned and cannot be used for launches");
    }
    return rocket;
  }

  private LocalDateTime parseScheduledAt(String scheduledAt) {
    if (scheduledAt == null || scheduledAt.isBlank()) {
      throw new IllegalArgumentException("Scheduled time is required");
    }
    try {
      return LocalDateTime.parse(scheduledAt);
    } catch (DateTimeParseException e) {
      throw new IllegalArgumentException("Scheduled time must be a valid ISO-8601 datetime");
    }
  }

  private void validate(LocalDateTime scheduledAt, Double pricePerTicket, Integer minimumOccupancy, int rocketCapacity) {
    if (scheduledAt.isBefore(LocalDateTime.now())) {
      throw new IllegalArgumentException("Scheduled time must be in the future");
    }
    if (pricePerTicket == null || pricePerTicket <= 0) {
      throw new IllegalArgumentException("Price per ticket must be greater than zero");
    }
    if (minimumOccupancy == null || minimumOccupancy < 1 || minimumOccupancy > rocketCapacity) {
      throw new IllegalArgumentException(
          "Minimum occupancy must be between 1 and rocket capacity (" + rocketCapacity + ")");
    }
  }

  private LaunchStatus parseStatus(String status) {
    if (status == null || status.isBlank()) {
      throw new IllegalArgumentException("Status is required");
    }
    try {
      return LaunchStatus.valueOf(status.toUpperCase());
    } catch (IllegalArgumentException e) {
      throw new IllegalArgumentException("Invalid status: " + status);
    }
  }

  private LaunchResponse toResponse(Launch launch) {
    return new LaunchResponse(
        launch.getId(),
        launch.getRocket().getId(),
        launch.getRocket().getName(),
        launch.getScheduledAt().toString(),
        launch.getPricePerTicket(),
        launch.getMinimumOccupancy(),
        launch.getStatus().name().toLowerCase());
  }
}
