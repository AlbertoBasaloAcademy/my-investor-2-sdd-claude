package dev.aiddbot.abjavareact.launches;

import dev.aiddbot.abjavareact.rockets.Rocket;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "launch")
public class Launch {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;

  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "rocket_id", nullable = false)
  private Rocket rocket;

  @Column(nullable = false)
  private LocalDateTime scheduledAt;

  @Column(nullable = false)
  private double pricePerTicket;

  @Column(nullable = false)
  private int minimumOccupancy;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private LaunchStatus status = LaunchStatus.CREATED;

  protected Launch() {
  }

  public Launch(Rocket rocket, LocalDateTime scheduledAt, double pricePerTicket, int minimumOccupancy) {
    this.rocket = rocket;
    this.scheduledAt = scheduledAt;
    this.pricePerTicket = pricePerTicket;
    this.minimumOccupancy = minimumOccupancy;
    this.status = LaunchStatus.CREATED;
  }

  public String getId() {
    return id;
  }

  public Rocket getRocket() {
    return rocket;
  }

  public LocalDateTime getScheduledAt() {
    return scheduledAt;
  }

  public double getPricePerTicket() {
    return pricePerTicket;
  }

  public int getMinimumOccupancy() {
    return minimumOccupancy;
  }

  public LaunchStatus getStatus() {
    return status;
  }

  public void update(LocalDateTime scheduledAt, double pricePerTicket, int minimumOccupancy) {
    this.scheduledAt = scheduledAt;
    this.pricePerTicket = pricePerTicket;
    this.minimumOccupancy = minimumOccupancy;
  }

  public void transitionTo(LaunchStatus target) {
    if (!this.status.canTransitionTo(target)) {
      throw new IllegalStateException(
          "Cannot transition launch from " + this.status.name().toLowerCase()
          + " to " + target.name().toLowerCase());
    }
    this.status = target;
  }
}
