package dev.aiddbot.abjavareact.launches;

import java.util.Map;
import java.util.Set;

public enum LaunchStatus {
  CREATED, CONFIRMED, COMPLETED, CANCELLED;

  private static final Map<LaunchStatus, Set<LaunchStatus>> ALLOWED = Map.of(
      CREATED, Set.of(CONFIRMED, CANCELLED),
      CONFIRMED, Set.of(COMPLETED, CANCELLED),
      COMPLETED, Set.of(),
      CANCELLED, Set.of()
  );

  public boolean canTransitionTo(LaunchStatus target) {
    return ALLOWED.get(this).contains(target);
  }
}
