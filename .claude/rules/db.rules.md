---
description: Code rules for the db container of My-Investor
paths: ["back/src/main/java/**"]
---
# DB code rules — My-Investor

## Summary

Schema is declared entirely through JPA `@Entity` classes in `back/`; there are no migration scripts. Each entity class owns its table name, column constraints, and domain mutation methods. The principle that matters most: the `@Entity` class is the single source of truth for the physical schema.

## Naming

| Element | Convention | Example |
|---------|------------|---------|
| Entity class | PascalCase noun | `Rocket`, `Launch`, `HealthCheck` |
| Table name (`@Table`) | snake_case, singular | `rocket`, `launch`, `health_check` |
| Column names | Spring default snake_case from camelCase field | `scheduledAt` → `scheduled_at` |
| Explicit column names | snake_case in `@Column(name = "...")` | `database_status`, `uptime_seconds` |
| Enum columns | `@Enumerated(EnumType.STRING)` — stored as text | `status` = `"CREATED"` |
| Domain entity PK | `String` UUID via `GenerationType.UUID` | `rocket.id`, `launch.id` |
| Audit/log entity PK | `Long` auto-increment via `GenerationType.IDENTITY` | `health_check.id` |

## Artifact roles

| Role | Structural rule (one line) |
|------|----------------------------|
| `@Entity` class | Declares table, all column constraints, and domain mutation methods; no service logic |
| Enum | Separate file in the same package; always persisted as `EnumType.STRING` |
| JPA config | `application.yml` only; dialect = `SQLiteDialect`, `ddl-auto: update` in prod, `create-drop` in test |

## Canonical example

> `Rocket.java` — plain entity with UUID PK, explicit column constraints, protected no-arg constructor, and domain methods.

```java
@Entity
@Table(name = "rocket")
public class Rocket {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;

  @Column(nullable = false, unique = true)
  private String name;

  @Column(nullable = false)
  private boolean decommissioned = false;

  protected Rocket() {}

  public Rocket(String name, int capacity, String range) {
    this.name = name; this.capacity = capacity; this.range = range;
  }

  public void decommission() { this.decommissioned = true; }
}
```

## Conventions

- **Wiring**: relationships use `@ManyToOne` with an explicit `@JoinColumn`; no `@OneToMany` inverse collections are declared anywhere.
- **Errors**: schema errors surface at startup via Hibernate DDL; no custom error handling at the DB layer.
- **Testing**: use a separate SQLite file (`target/test-*.db`) with `ddl-auto: create-drop` declared in `back/src/test/resources/application.yml`.
- **Avoid**: migration tools (Flyway/Liquibase) — Hibernate owns the schema; `@OneToMany` without owning side — prefer FK ownership on the child entity; `@Column` without `nullable = false` — always declare nullability explicitly; `FetchType.LAZY` on `@ManyToOne` — the codebase uses `EAGER` throughout.
