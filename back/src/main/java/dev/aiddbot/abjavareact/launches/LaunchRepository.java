package dev.aiddbot.abjavareact.launches;

import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LaunchRepository extends JpaRepository<Launch, String> {

  boolean existsByRocket_IdAndStatusIn(String rocketId, Collection<LaunchStatus> statuses);

  List<Launch> findAllByOrderByScheduledAtDesc();
}
