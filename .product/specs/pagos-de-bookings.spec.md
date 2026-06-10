# Pagos de Bookings

## Funcionalidad:

Gestión del pago asociado a una reserva (booking) de viaje espacial.

- Permitir al usuario pagar una reserva mediante **tarjeta de crédito/débito** o **transferencia bancaria**
- Mostrar un formulario de pago sencillo con los datos requeridos según el método elegido:
  - Tarjeta: número de tarjeta, titular, fecha de expiración, CVV
  - Transferencia: IBAN del titular y referencia del booking
- Validar los datos del pago en el servidor antes de procesarlo
- Persistir el pago con uno de estos tres estados: `PENDIENTE`, `CONFIRMADO`, `FALLIDO`
- Mostrar pantalla de confirmación con el resultado del pago y el resumen de la reserva
- Tratar los errores con try/catch y devolver mensajes claros al usuario

- Lee y sigue el doc de [arquitectura](../../arquitectura.md)

Feature Slug: pagos-de-bookings