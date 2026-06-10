---
description: Code rules for the back container of My-Investor (ab-java-react)
paths: ["back/src/**"]
---
# Back code rules — My-Investor (ab-java-react)

## Summary

Feature-packaged Spring Boot layered API: one package per domain (`health`, `rockets`, `launches`), each containing its own Controller → Service → Repository → Entity stack. The one principle that matters most: **all business logic and validation belongs in the Service; controllers handle HTTP mapping only**.

## Naming

| Element | Convention | Example |
|---------|------------|---------|
| Feature packages | lowercase noun | `rockets`, `launches`, `health`, `shared` |
| Entity classes | PascalCase, no suffix | `Rocket`, `Launch`, `HealthCheck` |
| Repository interfaces | `{Entity}Repository` | `RocketRepository` |
| Service classes | `{Entity}Service` | `RocketService` |
| Controller classes | `{Entity}Controller` | `RocketController` |
| Request records | `{Entity}Request` | `RocketRequest`, `LaunchStatusRequest` |
| Response records | `{Entity}Response` | `RocketResponse`, `LaunchResponse` |
| Test classes | `{Subject}Test` (no "should" prefix) | `RocketServiceTest` |
| Test methods | verb + scenario, camelCase | `createsRocketWithValidData` |

## Artifact roles

| Role | Structural rule |
|------|----------------|
| Entity (`@Entity`) | JPA-managed; exposes domain mutators (`update()`, `decommission()`, `transitionTo()`); no validation logic |
| Repository (`JpaRepository`) | Spring Data interface; extend with derived query methods only (no `@Query`) |
| Service (`@Service`) | Owns validation, business rules, and Entity→Response mapping; throws only standard JDK exceptions |
| Controller (`@RestController`) | Maps HTTP verbs to service calls; contains `@ExceptionHandler` methods for 400/404/409; no logic |
| Request record | Immutable Java record; all fields unvalidated (validation happens in service) |
| Response record | Immutable Java record; flattened view — no nested entity references |
| ErrorResponse | `record ErrorResponse(String message)`; defined per feature package (not shared) |
| Configuration (`@Configuration`) | Lives in `shared/` only; not inside feature packages |

## Canonical example

> `RocketService` — representative service: constructor injection, validate-before-persist, entity→record mapping.

```java
@Service
public class RocketService {

  private static final Set<String> VALID_RANGES = Set.of("Earth", "Moon", "Mars");

  private final RocketRepository repository;
  private final LaunchRepository launchRepository;

  public RocketService(RocketRepository repository, LaunchRepository launchRepository) {
    this.repository = repository;
    this.launchRepository = launchRepository;
  }

  public RocketResponse create(RocketRequest request) {
    validate(request, null);
    return toResponse(repository.save(new Rocket(request.name(), request.capacity(), request.range())));
  }

  public void decommission(String id) {
    Rocket rocket = repository.findById(id)
        .orElseThrow(() -> new NoSuchElementException("Rocket not found: " + id));
    if (launchRepository.existsByRocket_IdAndStatusIn(id, Set.of(LaunchStatus.CREATED, LaunchStatus.CONFIRMED))) {
      throw new IllegalStateException("Rocket has active launches and cannot be decommissioned");
    }
    rocket.decommission();
    repository.save(rocket);
  }

  private RocketResponse toResponse(Rocket rocket) {
    return new RocketResponse(
        rocket.getId(), rocket.getName(), rocket.getCapacity(),
        rocket.getRange(), rocket.isDecommissioned());
  }
}
```

## Conventions

- **Wiring**: Constructor injection; no `@Autowired` on constructor fields (implicit since Spring 4.3). Exception: `HealthService` annotates its public constructor with `@Autowired` to disambiguate from a package-private test constructor that accepts a `Clock`.
- **Errors**: Services throw only standard JDK exceptions — `IllegalArgumentException` (→ 400), `NoSuchElementException` (→ 404), `IllegalStateException` (→ 409). Controllers catch and map via `@ExceptionHandler` methods.
- **Testing**: Unit tests under `src/test/java` in the matching package; `@ExtendWith(MockitoExtension.class)` + `@Mock` fields; no Spring context loaded. Test methods follow verb+scenario naming (`throwsWhenDecommissioningRocketWithActiveLaunches`).
- **Avoid**: Field injection (`@Autowired` on fields); returning `@Entity` objects directly from controllers; placing validation or business rules in controllers or entities; sharing `ErrorResponse` records across feature packages.
