import { test, expect, type APIRequestContext } from '@playwright/test';
import { BookingPage } from '../pages/BookingPage';

const API_URL = process.env.E2E_API_URL ?? 'http://localhost:8080';

const PASSENGER = {
  passengerName: 'Ada Lovelace',
  passengerEmail: 'ada@example.com',
  passengerPhone: '+34 600 000 001',
};

/** Creates a fresh rocket + launch via the API and returns the launch id. */
async function createLaunch(request: APIRequestContext): Promise<string> {
  const rocketRes = await request.post(`${API_URL}/api/rockets`, {
    data: {
      name: `E2E Bookings ${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      capacity: 4,
      range: 'Moon',
    },
  });
  expect(rocketRes.ok(), 'fixture: rocket creation must succeed').toBeTruthy();
  const rocket = await rocketRes.json();

  const scheduledAt = new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().slice(0, 19);
  const launchRes = await request.post(`${API_URL}/api/launches`, {
    data: { rocketId: rocket.id, scheduledAt, pricePerTicket: 100, minimumOccupancy: 1 },
  });
  expect(launchRes.ok(), 'fixture: launch creation must succeed').toBeTruthy();
  const launch = await launchRes.json();
  return launch.id as string;
}

/** Creates a booking via the API and returns its id. */
async function createBooking(request: APIRequestContext, launchId: string): Promise<string> {
  const res = await request.post(`${API_URL}/api/launches/${launchId}/bookings`, {
    data: PASSENGER,
  });
  expect(res.ok(), 'fixture: booking creation must succeed').toBeTruthy();
  const booking = await res.json();
  return booking.id as string;
}

test.describe('Bookings', () => {
  test('creates a booking with valid passenger details and shows it as created', async ({
    page,
    request,
  }) => {
    const launchId = await createLaunch(request);

    const bookings = new BookingPage(page);
    await bookings.goto();
    await bookings.selectLaunch(launchId);
    await bookings.fillForm(PASSENGER.passengerName, PASSENGER.passengerEmail, PASSENGER.passengerPhone);
    await bookings.submitForm();

    await expect(bookings.getBookingItems()).toHaveCount(1);
    await expect(bookings.getBookingStatus(0)).toHaveText('created');
  });

  test('cancels a booking and the cancelled status survives a page reload', async ({
    page,
    request,
  }) => {
    const launchId = await createLaunch(request);
    await createBooking(request, launchId);

    const bookings = new BookingPage(page);
    await bookings.goto();
    await bookings.selectLaunch(launchId);
    await expect(bookings.getBookingItems()).toHaveCount(1);

    await bookings.cancelBooking(0);
    await expect(bookings.getBookingStatus(0)).toHaveText('cancelled');

    await page.reload();
    await bookings.selectLaunch(launchId);
    await expect(bookings.getBookingItems()).toHaveCount(1);
    await expect(bookings.getBookingStatus(0)).toHaveText('cancelled');
  });

  test('lists both created and cancelled bookings for a launch', async ({ page, request }) => {
    const launchId = await createLaunch(request);
    await createBooking(request, launchId);
    const cancelledId = await createBooking(request, launchId);
    const cancelRes = await request.patch(`${API_URL}/api/bookings/${cancelledId}/cancel`);
    expect(cancelRes.ok(), 'fixture: cancellation must succeed').toBeTruthy();

    const bookings = new BookingPage(page);
    await bookings.goto();
    await bookings.selectLaunch(launchId);

    await expect(bookings.getBookingItems()).toHaveCount(2);
    await expect(bookings.statuses.filter({ hasText: /^created$/ })).toHaveCount(1);
    await expect(bookings.statuses.filter({ hasText: /^cancelled$/ })).toHaveCount(1);
  });

  test('returns 404 when booking a launch that does not exist (API)', async ({ request }) => {
    const res = await request.post(`${API_URL}/api/launches/non-existent-id/bookings`, {
      data: PASSENGER,
    });

    expect(res.status()).toBe(404);
    const body = await res.json();
    expect(body.message).toBeTruthy();
  });

  test('returns 400 when a required passenger field is missing (API)', async ({ request }) => {
    const launchId = await createLaunch(request);

    const res = await request.post(`${API_URL}/api/launches/${launchId}/bookings`, {
      data: {
        passengerEmail: PASSENGER.passengerEmail,
        passengerPhone: PASSENGER.passengerPhone,
      },
    });

    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.message).toBeTruthy();
  });

  test('returns 409 when cancelling an already-cancelled booking (API)', async ({ request }) => {
    const launchId = await createLaunch(request);
    const bookingId = await createBooking(request, launchId);

    const firstCancel = await request.patch(`${API_URL}/api/bookings/${bookingId}/cancel`);
    expect(firstCancel.ok(), 'fixture: first cancellation must succeed').toBeTruthy();

    const secondCancel = await request.patch(`${API_URL}/api/bookings/${bookingId}/cancel`);
    expect(secondCancel.status()).toBe(409);
    const body = await secondCancel.json();
    expect(body.message).toBeTruthy();
  });

  test('blocks form submission until all passenger fields are filled', async ({
    page,
    request,
  }) => {
    const launchId = await createLaunch(request);

    const bookings = new BookingPage(page);
    await bookings.goto();
    await bookings.selectLaunch(launchId);

    await expect(bookings.submitButton).toBeDisabled();
    await expect(bookings.getBookingItems()).toHaveCount(0);

    await bookings.nameInput.fill(PASSENGER.passengerName);
    await expect(bookings.submitButton).toBeDisabled();
    await expect(bookings.getBookingItems()).toHaveCount(0);
  });

  test('marks cancelled bookings as visually distinct in the list', async ({ page, request }) => {
    const launchId = await createLaunch(request);
    const bookingId = await createBooking(request, launchId);
    const cancelRes = await request.patch(`${API_URL}/api/bookings/${bookingId}/cancel`);
    expect(cancelRes.ok(), 'fixture: cancellation must succeed').toBeTruthy();

    const bookings = new BookingPage(page);
    await bookings.goto();
    await bookings.selectLaunch(launchId);

    await expect(bookings.getBookingItems()).toHaveCount(1);
    await expect(bookings.getBookingItems().first()).toHaveClass(/booking--cancelled/);
  });
});
