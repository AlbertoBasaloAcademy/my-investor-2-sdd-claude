package dev.aiddbot.abjavareact.rockets;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "rocket")
public class Rocket {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;

  @Column(nullable = false, unique = true)
  private String name;

  @Column(nullable = false)
  private int capacity;

  @Column(nullable = false)
  private String range;

  @Column(nullable = false)
  private boolean decommissioned = false;

  protected Rocket() {
  }

  public Rocket(String name, int capacity, String range) {
    this.name = name;
    this.capacity = capacity;
    this.range = range;
  }

  public Rocket(String id, String name, int capacity, String range) {
    this.id = id;
    this.name = name;
    this.capacity = capacity;
    this.range = range;
  }

  public Rocket(String id, String name, int capacity, String range, boolean decommissioned) {
    this.id = id;
    this.name = name;
    this.capacity = capacity;
    this.range = range;
    this.decommissioned = decommissioned;
  }

  public String getId() {
    return id;
  }

  public String getName() {
    return name;
  }

  public int getCapacity() {
    return capacity;
  }

  public String getRange() {
    return range;
  }

  public boolean isDecommissioned() {
    return decommissioned;
  }

  public void update(String name, int capacity, String range) {
    this.name = name;
    this.capacity = capacity;
    this.range = range;
  }

  public void decommission() {
    this.decommissioned = true;
  }
}
