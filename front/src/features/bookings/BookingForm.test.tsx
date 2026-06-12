import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BookingForm } from './BookingForm';

test('disables submit while any field is empty', async () => {
  const user = userEvent.setup();
  render(<BookingForm onSubmit={vi.fn()} />);

  expect(screen.getByTestId('booking-submit')).toBeDisabled();

  await user.type(screen.getByTestId('booking-name'), 'Ada Lovelace');
  expect(screen.getByTestId('booking-submit')).toBeDisabled();

  await user.type(screen.getByTestId('booking-email'), 'ada@example.com');
  expect(screen.getByTestId('booking-submit')).toBeDisabled();

  await user.type(screen.getByTestId('booking-phone'), '+34 600 000 001');
  expect(screen.getByTestId('booking-submit')).toBeEnabled();
});

test('submits the booking request and clears the form', async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn().mockResolvedValue(undefined);
  render(<BookingForm onSubmit={onSubmit} />);

  await user.type(screen.getByTestId('booking-name'), 'Ada Lovelace');
  await user.type(screen.getByTestId('booking-email'), 'ada@example.com');
  await user.type(screen.getByTestId('booking-phone'), '+34 600 000 001');
  await user.click(screen.getByTestId('booking-submit'));

  expect(onSubmit).toHaveBeenCalledWith({
    passengerName: 'Ada Lovelace',
    passengerEmail: 'ada@example.com',
    passengerPhone: '+34 600 000 001',
  });
  expect(screen.getByTestId('booking-name')).toHaveValue('');
  expect(screen.getByTestId('booking-email')).toHaveValue('');
  expect(screen.getByTestId('booking-phone')).toHaveValue('');
});

test('shows the error and keeps values when submit fails', async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn().mockRejectedValue(new Error('Launch is full'));
  render(<BookingForm onSubmit={onSubmit} />);

  await user.type(screen.getByTestId('booking-name'), 'Ada Lovelace');
  await user.type(screen.getByTestId('booking-email'), 'ada@example.com');
  await user.type(screen.getByTestId('booking-phone'), '+34 600 000 001');
  await user.click(screen.getByTestId('booking-submit'));

  const error = await screen.findByTestId('booking-form-error');
  expect(error).toHaveTextContent('Launch is full');
  expect(screen.getByTestId('booking-name')).toHaveValue('Ada Lovelace');
});
