package dev.aiddbot.abjavareact.rockets;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class RocketServiceTest {

  @Mock
  private RocketRepository repository;

  @Test
  void createsRocketWithValidData() {
    Rocket saved = new Rocket("uuid-1", "Falcon 9", 5, "Earth");
    given(repository.existsByName("Falcon 9")).willReturn(false);
    given(repository.save(any(Rocket.class))).willReturn(saved);
    RocketService service = new RocketService(repository);

    RocketResponse response = service.create(new RocketRequest("Falcon 9", 5, "Earth"));

    assertThat(response.id()).isEqualTo("uuid-1");
    assertThat(response.name()).isEqualTo("Falcon 9");
    assertThat(response.capacity()).isEqualTo(5);
    assertThat(response.range()).isEqualTo("Earth");
  }

  @Test
  void throwsWhenNameIsDuplicate() {
    given(repository.existsByName("Falcon 9")).willReturn(true);
    RocketService service = new RocketService(repository);

    assertThatThrownBy(() -> service.create(new RocketRequest("Falcon 9", 5, "Earth")))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("unique");
  }

  @Test
  void throwsWhenCapacityIsTooLow() {
    RocketService service = new RocketService(repository);

    assertThatThrownBy(() -> service.create(new RocketRequest("Falcon 9", 0, "Earth")))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("Capacity");
  }

  @Test
  void throwsWhenCapacityIsTooHigh() {
    RocketService service = new RocketService(repository);

    assertThatThrownBy(() -> service.create(new RocketRequest("Falcon 9", 10, "Earth")))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("Capacity");
  }

  @Test
  void throwsWhenRangeIsInvalid() {
    RocketService service = new RocketService(repository);

    assertThatThrownBy(() -> service.create(new RocketRequest("Falcon 9", 5, "Jupiter")))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("Range");
  }

  @Test
  void throwsWhenNameIsBlank() {
    RocketService service = new RocketService(repository);

    assertThatThrownBy(() -> service.create(new RocketRequest("  ", 5, "Earth")))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("Name");
  }

  @Test
  void returnsAllRockets() {
    given(repository.findAll()).willReturn(List.of(
        new Rocket("uuid-1", "Falcon 9", 5, "Earth"),
        new Rocket("uuid-2", "Starship", 9, "Mars")
    ));
    RocketService service = new RocketService(repository);

    List<RocketResponse> rockets = service.findAll();

    assertThat(rockets).hasSize(2);
    assertThat(rockets.get(0).name()).isEqualTo("Falcon 9");
    assertThat(rockets.get(1).name()).isEqualTo("Starship");
  }

  @Test
  void updatesRocketData() {
    Rocket existing = new Rocket("uuid-1", "Falcon 9", 5, "Earth");
    given(repository.findById("uuid-1")).willReturn(Optional.of(existing));
    given(repository.existsByNameAndIdNot("Apollo", "uuid-1")).willReturn(false);
    given(repository.save(existing)).willReturn(existing);
    RocketService service = new RocketService(repository);

    RocketResponse response = service.update("uuid-1", new RocketRequest("Apollo", 3, "Moon"));

    assertThat(response.name()).isEqualTo("Apollo");
    assertThat(response.capacity()).isEqualTo(3);
    assertThat(response.range()).isEqualTo("Moon");
  }

  @Test
  void throwsWhenUpdatingNonExistentRocket() {
    given(repository.findById("unknown")).willReturn(Optional.empty());
    RocketService service = new RocketService(repository);

    assertThatThrownBy(() -> service.update("unknown", new RocketRequest("Apollo", 3, "Moon")))
        .isInstanceOf(NoSuchElementException.class);
  }

  @Test
  void decommissionsRocket() {
    given(repository.existsById("uuid-1")).willReturn(true);
    RocketService service = new RocketService(repository);

    service.decommission("uuid-1");

    verify(repository).deleteById("uuid-1");
  }

  @Test
  void throwsWhenDecommissioningNonExistentRocket() {
    given(repository.existsById("unknown")).willReturn(false);
    RocketService service = new RocketService(repository);

    assertThatThrownBy(() -> service.decommission("unknown"))
        .isInstanceOf(NoSuchElementException.class);
  }
}
