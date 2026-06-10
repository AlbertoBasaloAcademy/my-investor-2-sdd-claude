package dev.aiddbot.abjavareact.rockets;

import java.util.List;
import java.util.NoSuchElementException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/rockets")
public class RocketController {

  private final RocketService service;

  public RocketController(RocketService service) {
    this.service = service;
  }

  @PostMapping
  public ResponseEntity<RocketResponse> create(@RequestBody RocketRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
  }

  @GetMapping
  public ResponseEntity<List<RocketResponse>> findAll() {
    return ResponseEntity.ok(service.findAll());
  }

  @PutMapping("/{id}")
  public ResponseEntity<RocketResponse> update(@PathVariable String id, @RequestBody RocketRequest request) {
    return ResponseEntity.ok(service.update(id, request));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> decommission(@PathVariable String id) {
    service.decommission(id);
    return ResponseEntity.noContent().build();
  }

  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<ErrorResponse> handleValidation(IllegalArgumentException ex) {
    return ResponseEntity.badRequest().body(new ErrorResponse(ex.getMessage()));
  }

  @ExceptionHandler(NoSuchElementException.class)
  public ResponseEntity<ErrorResponse> handleNotFound(NoSuchElementException ex) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse(ex.getMessage()));
  }
}
