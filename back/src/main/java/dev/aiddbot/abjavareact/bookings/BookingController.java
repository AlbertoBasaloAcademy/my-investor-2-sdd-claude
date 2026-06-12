package dev.aiddbot.abjavareact.bookings;

import jakarta.validation.Valid;
import java.util.List;
import java.util.NoSuchElementException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class BookingController {

  private final BookingService service;

  public BookingController(BookingService service) {
    this.service = service;
  }

  @PostMapping("/launches/{launchId}/bookings")
  public ResponseEntity<BookingResponse> create(
      @PathVariable String launchId, @Valid @RequestBody BookingRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED).body(service.createBooking(launchId, request));
  }

  @GetMapping("/launches/{launchId}/bookings")
  public ResponseEntity<List<BookingResponse>> findByLaunch(@PathVariable String launchId) {
    return ResponseEntity.ok(service.getBookingsByLaunch(launchId));
  }

  @GetMapping("/bookings/{id}")
  public ResponseEntity<BookingResponse> findById(@PathVariable String id) {
    return ResponseEntity.ok(service.getBookingById(id));
  }

  @PatchMapping("/bookings/{id}/cancel")
  public ResponseEntity<BookingResponse> cancel(@PathVariable String id) {
    return ResponseEntity.ok(service.cancelBooking(id));
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
    String message = ex.getBindingResult().getFieldErrors().stream()
        .map(error -> error.getDefaultMessage())
        .findFirst()
        .orElse("Invalid request");
    return ResponseEntity.badRequest().body(new ErrorResponse(message));
  }

  @ExceptionHandler(IllegalStateException.class)
  public ResponseEntity<ErrorResponse> handleConflict(IllegalStateException ex) {
    return ResponseEntity.status(HttpStatus.CONFLICT).body(new ErrorResponse(ex.getMessage()));
  }

  @ExceptionHandler(NoSuchElementException.class)
  public ResponseEntity<ErrorResponse> handleNotFound(NoSuchElementException ex) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse(ex.getMessage()));
  }
}
