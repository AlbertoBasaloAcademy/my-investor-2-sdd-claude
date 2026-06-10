import { useEffect, useState } from 'react';
import { getRockets } from '../rockets/rocketsApi';
import { useLaunches } from './useLaunches';
import type { Rocket } from '../../shared/types/rockets';
import type { Launch, LaunchRequest, LaunchStatus } from '../../shared/types/launches';
import './LaunchCatalog.css';

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function toDatetimeLocal(iso: string): string {
  return iso.slice(0, 16);
}

function StatusBadge({ status }: { status: LaunchStatus }) {
  return (
    <span className={`launch-status launch-status--${status}`} data-testid="launch-status">
      {status}
    </span>
  );
}

function LaunchForm({
  rockets,
  initial,
  onSubmit,
  onCancel,
}: {
  rockets: Rocket[];
  initial?: Launch;
  onSubmit: (request: LaunchRequest) => Promise<void>;
  onCancel: () => void;
}) {
  const defaultRocketId = rockets[0]?.id ?? '';
  const selectedRocketCapacity = (rocketId: string) =>
    rockets.find((r) => r.id === rocketId)?.capacity ?? 1;

  const [form, setForm] = useState<LaunchRequest>(
    initial
      ? {
          rocketId: initial.rocketId,
          scheduledAt: toDatetimeLocal(initial.scheduledAt),
          pricePerTicket: initial.pricePerTicket,
          minimumOccupancy: initial.minimumOccupancy,
        }
      : {
          rocketId: defaultRocketId,
          scheduledAt: '',
          pricePerTicket: 100,
          minimumOccupancy: 1,
        },
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const capacity = selectedRocketCapacity(form.rocketId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    try {
      await onSubmit(form);
      onCancel();
    } catch (cause: unknown) {
      setFormError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="launch-form" onSubmit={handleSubmit} data-testid="launch-form">
      {!initial && (
        <div className="launch-form-row">
          <label htmlFor="launch-rocket">Rocket</label>
          <select
            id="launch-rocket"
            value={form.rocketId}
            onChange={(e) => setForm({ ...form, rocketId: e.target.value, minimumOccupancy: 1 })}
            required
            data-testid="launch-rocket-select"
          >
            {rockets.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} (cap. {r.capacity})
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="launch-form-row">
        <label htmlFor="launch-scheduled-at">Scheduled Time</label>
        <input
          id="launch-scheduled-at"
          type="datetime-local"
          value={form.scheduledAt}
          onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
          required
          data-testid="launch-scheduled-at-input"
        />
      </div>
      <div className="launch-form-row">
        <label htmlFor="launch-price">Price per Ticket ($)</label>
        <input
          id="launch-price"
          type="number"
          min={1}
          step={0.01}
          value={form.pricePerTicket}
          onChange={(e) => setForm({ ...form, pricePerTicket: Number(e.target.value) })}
          required
          data-testid="launch-price-input"
        />
      </div>
      <div className="launch-form-row">
        <label htmlFor="launch-min-occupancy">Minimum Occupancy (max {capacity})</label>
        <input
          id="launch-min-occupancy"
          type="number"
          min={1}
          max={capacity}
          value={form.minimumOccupancy}
          onChange={(e) => setForm({ ...form, minimumOccupancy: Number(e.target.value) })}
          required
          data-testid="launch-min-occupancy-input"
        />
      </div>
      {formError && (
        <p className="launch-form-error" role="alert" data-testid="launch-form-error">
          {formError}
        </p>
      )}
      <div className="launch-form-actions">
        <button type="submit" disabled={isSubmitting} data-testid="launch-submit-btn">
          {initial ? 'Update' : 'Schedule'}
        </button>
        <button type="button" onClick={onCancel} data-testid="launch-cancel-btn">
          Cancel
        </button>
      </div>
    </form>
  );
}

function LaunchItem({
  launch,
  onTransition,
  onEdit,
}: {
  launch: Launch;
  onTransition: (id: string, status: LaunchStatus) => Promise<void>;
  onEdit: (launch: Launch) => void;
}) {
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleTransition(status: LaunchStatus) {
    setActionError(null);
    try {
      await onTransition(launch.id, status);
    } catch (cause: unknown) {
      setActionError(cause instanceof Error ? cause.message : String(cause));
    }
  }

  return (
    <div className="launch-details">
      <div className="launch-header-row">
        <span className="launch-rocket" data-testid="launch-rocket-name">
          {launch.rocketName}
        </span>
        <StatusBadge status={launch.status} />
      </div>
      <span className="launch-meta">
        {formatDateTime(launch.scheduledAt)} · ${launch.pricePerTicket.toFixed(2)}/ticket · min {launch.minimumOccupancy} seats
      </span>
      {actionError && (
        <p className="launch-form-error" role="alert" data-testid="launch-action-error">
          {actionError}
        </p>
      )}
      <div className="launch-actions">
        {launch.status === 'created' && (
          <>
            <button onClick={() => void handleTransition('confirmed')} data-testid="launch-confirm-btn">
              Confirm
            </button>
            <button onClick={() => onEdit(launch)} data-testid="launch-edit-btn">
              Edit
            </button>
            <button
              className="launch-cancel-btn"
              onClick={() => void handleTransition('cancelled')}
              data-testid="launch-cancel-action-btn"
            >
              Cancel
            </button>
          </>
        )}
        {launch.status === 'confirmed' && (
          <>
            <button onClick={() => void handleTransition('completed')} data-testid="launch-complete-btn">
              Complete
            </button>
            <button
              className="launch-cancel-btn"
              onClick={() => void handleTransition('cancelled')}
              data-testid="launch-cancel-action-btn"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function LaunchCatalog() {
  const { launches, error, isLoading, create, update, transition } = useLaunches();
  const [activeRockets, setActiveRockets] = useState<Rocket[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingLaunch, setEditingLaunch] = useState<Launch | null>(null);

  useEffect(() => {
    getRockets()
      .then((rockets) => setActiveRockets(rockets.filter((r) => !r.decommissioned)))
      .catch(() => setActiveRockets([]));
  }, []);

  if (isLoading) {
    return (
      <section className="launch-catalog" aria-busy="true">
        <p data-testid="launches-loading">Loading launches…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="launch-catalog">
        <p className="launch-error" data-testid="launches-error" role="alert">
          Failed to load launches.
        </p>
      </section>
    );
  }

  return (
    <section className="launch-catalog">
      <header className="launch-catalog-header">
        <h2>Launch Catalog</h2>
        {!isAdding && !editingLaunch && activeRockets.length > 0 && (
          <button onClick={() => setIsAdding(true)} data-testid="schedule-launch-btn">
            Schedule Launch
          </button>
        )}
      </header>

      {isAdding && (
        <LaunchForm rockets={activeRockets} onSubmit={create} onCancel={() => setIsAdding(false)} />
      )}

      {editingLaunch && (
        <LaunchForm
          rockets={activeRockets}
          initial={editingLaunch}
          onSubmit={(req) => update(editingLaunch.id, req)}
          onCancel={() => setEditingLaunch(null)}
        />
      )}

      {launches.length === 0 ? (
        <p data-testid="launches-empty">No launches scheduled.</p>
      ) : (
        <ul className="launch-list">
          {launches.map((launch) => (
            <li key={launch.id} className="launch-item" data-testid="launch-item">
              <LaunchItem
                launch={launch}
                onTransition={transition}
                onEdit={(l) => setEditingLaunch(l)}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
