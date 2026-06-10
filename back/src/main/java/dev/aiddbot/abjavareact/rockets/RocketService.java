package dev.aiddbot.abjavareact.rockets;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Set;
import org.springframework.stereotype.Service;

@Service
public class RocketService {

  private static final Set<String> VALID_RANGES = Set.of("Earth", "Moon", "Mars");

  private final RocketRepository repository;

  public RocketService(RocketRepository repository) {
    this.repository = repository;
  }

  public RocketResponse create(RocketRequest request) {
    validate(request, null);
    return toResponse(repository.save(new Rocket(request.name(), request.capacity(), request.range())));
  }

  public List<RocketResponse> findAll() {
    return repository.findAll().stream().map(this::toResponse).toList();
  }

  public RocketResponse update(String id, RocketRequest request) {
    Rocket rocket = repository.findById(id)
        .orElseThrow(() -> new NoSuchElementException("Rocket not found: " + id));
    validate(request, id);
    rocket.update(request.name(), request.capacity(), request.range());
    return toResponse(repository.save(rocket));
  }

  public void decommission(String id) {
    if (!repository.existsById(id)) {
      throw new NoSuchElementException("Rocket not found: " + id);
    }
    repository.deleteById(id);
  }

  private void validate(RocketRequest request, String excludeId) {
    if (request.name() == null || request.name().isBlank()) {
      throw new IllegalArgumentException("Name is required");
    }
    if (request.capacity() == null || request.capacity() < 1 || request.capacity() > 9) {
      throw new IllegalArgumentException("Capacity must be between 1 and 9");
    }
    if (request.range() == null || !VALID_RANGES.contains(request.range())) {
      throw new IllegalArgumentException("Range must be one of: Earth, Moon, Mars");
    }
    boolean nameExists = excludeId == null
        ? repository.existsByName(request.name())
        : repository.existsByNameAndIdNot(request.name(), excludeId);
    if (nameExists) {
      throw new IllegalArgumentException("Rocket name must be unique");
    }
  }

  private RocketResponse toResponse(Rocket rocket) {
    return new RocketResponse(rocket.getId(), rocket.getName(), rocket.getCapacity(), rocket.getRange());
  }
}
