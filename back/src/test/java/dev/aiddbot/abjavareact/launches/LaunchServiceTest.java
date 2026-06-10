package dev.aiddbot.abjavareact.launches;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;

import dev.aiddbot.abjavareact.rockets.Rocket;
import dev.aiddbot.abjavareact.rockets.RocketRepository;
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
class LaunchServiceTest {

  @Mock
  private LaunchRepository launchRepository;

  @Mock
  private RocketRepository rocketRepository;

  private LaunchService service;

  private Rocket activeRocket;
  private final String futureTime = LocalDateTime.now().plusDays(1).toString();

  @BeforeEach
  void setUp() {
    service = new LaunchService(launchRepository, rocketRepository);
    activeRocket = new Rocket("rocket-1", "Falcon 9", 5, "Earth");
  }

  @Test
  void createsLaunchWithValidData() {
    given(rocketRepository.findById("rocket-1")).willReturn(Optional.of(activeRocket));
    Launch saved = new Launch(activeRocket, LocalDateTime.parse(futureTime), 100.0, 3);
    given(launchRepository.save(any(Launch.class))).willReturn(saved);

    LaunchResponse response = service.create(new LaunchRequest("rocket-1", futureTime, 100.0, 3));

    assertThat(response.rocketId()).isEqualTo("rocket-1");
    assertThat(response.rocketName()).isEqualTo("Falcon 9");
    assertThat(response.pricePerTicket()).isEqualTo(100.0);
    assertThat(response.minimumOccupancy()).isEqualTo(3);
    assertThat(response.status()).isEqualTo("created");
  }

  @Test
  void throwsWhenRocketNotFound() {
    given(rocketRepository.findById("unknown")).willReturn(Optional.empty());

    assertThatThrownBy(() -> service.create(new LaunchRequest("unknown", futureTime, 100.0, 3)))
        .isInstanceOf(NoSuchElementException.class)
        .hasMessageContaining("Rocket not found");
  }

  @Test
  void throwsWhenRocketIsDecommissioned() {
    Rocket decommissioned = new Rocket("rocket-1", "Falcon 9", 5, "Earth", true);
    given(rocketRepository.findById("rocket-1")).willReturn(Optional.of(decommissioned));

    assertThatThrownBy(() -> service.create(new LaunchRequest("rocket-1", futureTime, 100.0, 3)))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("decommissioned");
  }

  @Test
  void throwsWhenScheduledAtIsInPast() {
    given(rocketRepository.findById("rocket-1")).willReturn(Optional.of(activeRocket));
    String pastTime = LocalDateTime.now().minusDays(1).toString();

    assertThatThrownBy(() -> service.create(new LaunchRequest("rocket-1", pastTime, 100.0, 3)))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("future");
  }

  @Test
  void throwsWhenPriceIsZero() {
    given(rocketRepository.findById("rocket-1")).willReturn(Optional.of(activeRocket));

    assertThatThrownBy(() -> service.create(new LaunchRequest("rocket-1", futureTime, 0.0, 3)))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("Price");
  }

  @Test
  void throwsWhenMinOccupancyExceedsCapacity() {
    given(rocketRepository.findById("rocket-1")).willReturn(Optional.of(activeRocket));

    assertThatThrownBy(() -> service.create(new LaunchRequest("rocket-1", futureTime, 100.0, 6)))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("capacity");
  }

  @Test
  void throwsWhenMinOccupancyIsZero() {
    given(rocketRepository.findById("rocket-1")).willReturn(Optional.of(activeRocket));

    assertThatThrownBy(() -> service.create(new LaunchRequest("rocket-1", futureTime, 100.0, 0)))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("occupancy");
  }

  @Test
  void returnsAllLaunches() {
    Launch l1 = new Launch(activeRocket, LocalDateTime.now().plusDays(2), 200.0, 2);
    Launch l2 = new Launch(activeRocket, LocalDateTime.now().plusDays(1), 100.0, 1);
    given(launchRepository.findAllByOrderByScheduledAtDesc()).willReturn(List.of(l1, l2));

    List<LaunchResponse> responses = service.findAll();

    assertThat(responses).hasSize(2);
  }

  @Test
  void throwsWhenFindByIdNotFound() {
    given(launchRepository.findById("unknown")).willReturn(Optional.empty());

    assertThatThrownBy(() -> service.findById("unknown"))
        .isInstanceOf(NoSuchElementException.class)
        .hasMessageContaining("Launch not found");
  }

  @Test
  void throwsWhenUpdatingNonCreatedLaunch() {
    Launch confirmed = new Launch(activeRocket, LocalDateTime.parse(futureTime), 100.0, 3);
    confirmed.transitionTo(LaunchStatus.CONFIRMED);
    given(launchRepository.findById("launch-1")).willReturn(Optional.of(confirmed));

    assertThatThrownBy(() -> service.update("launch-1", new LaunchRequest("rocket-1", futureTime, 200.0, 3)))
        .isInstanceOf(IllegalStateException.class)
        .hasMessageContaining("created");
  }

  @Test
  void transitionsCreatedToConfirmed() {
    Launch launch = new Launch(activeRocket, LocalDateTime.parse(futureTime), 100.0, 3);
    given(launchRepository.findById("launch-1")).willReturn(Optional.of(launch));
    given(launchRepository.save(any(Launch.class))).willReturn(launch);

    LaunchResponse response = service.transition("launch-1", new LaunchStatusRequest("confirmed"));

    assertThat(response.status()).isEqualTo("confirmed");
  }

  @Test
  void transitionsConfirmedToCompleted() {
    Launch launch = new Launch(activeRocket, LocalDateTime.parse(futureTime), 100.0, 3);
    launch.transitionTo(LaunchStatus.CONFIRMED);
    given(launchRepository.findById("launch-1")).willReturn(Optional.of(launch));
    given(launchRepository.save(any(Launch.class))).willReturn(launch);

    LaunchResponse response = service.transition("launch-1", new LaunchStatusRequest("completed"));

    assertThat(response.status()).isEqualTo("completed");
  }

  @Test
  void throwsOnInvalidTransition() {
    Launch launch = new Launch(activeRocket, LocalDateTime.parse(futureTime), 100.0, 3);
    launch.transitionTo(LaunchStatus.CONFIRMED);
    launch.transitionTo(LaunchStatus.COMPLETED);
    given(launchRepository.findById("launch-1")).willReturn(Optional.of(launch));

    assertThatThrownBy(() -> service.transition("launch-1", new LaunchStatusRequest("cancelled")))
        .isInstanceOf(IllegalStateException.class)
        .hasMessageContaining("Cannot transition");
  }

  @Test
  void throwsOnInvalidStatusString() {
    Launch launch = new Launch(activeRocket, LocalDateTime.parse(futureTime), 100.0, 3);
    given(launchRepository.findById("launch-1")).willReturn(Optional.of(launch));

    assertThatThrownBy(() -> service.transition("launch-1", new LaunchStatusRequest("flying")))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("Invalid status");
  }
}
