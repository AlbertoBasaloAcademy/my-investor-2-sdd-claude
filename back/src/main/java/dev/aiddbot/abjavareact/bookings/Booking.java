package dev.aiddbot.abjavareact.bookings;

import dev.aiddbot.abjavareact.launches.Launch;
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

@Entity
@Table(name = "booking")
public class Booking {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;

  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "launch_id", nullable = false)
  private Launch launch;

  @Column(nullable = false)
  private String passengerName;

  @Column(nullable = false)
  private String passengerEmail;

  @Column(nullable = false)
  private String passengerPhone;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private BookingStatus status = BookingStatus.CREATED;

  protected Booking() {
  }

  public Booking(Launch launch, String passengerName, String passengerEmail, String passengerPhone) {
    this.launch = launch;
    this.passengerName = passengerName;
    this.passengerEmail = passengerEmail;
    this.passengerPhone = passengerPhone;
    this.status = BookingStatus.CREATED;
  }

  public String getId() {
    return id;
  }

  public Launch getLaunch() {
    return launch;
  }

  public String getPassengerName() {
    return passengerName;
  }

  public String getPassengerEmail() {
    return passengerEmail;
  }

  public String getPassengerPhone() {
    return passengerPhone;
  }

  public BookingStatus getStatus() {
    return status;
  }

  public void cancel() {
    this.status = BookingStatus.CANCELLED;
  }
}
