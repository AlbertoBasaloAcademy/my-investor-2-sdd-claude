import { useState } from 'react';
import { useRockets } from './useRockets';
import type { Rocket, RocketRange, RocketRequest } from '../../shared/types/rockets';
import './RocketCatalog.css';

const RANGES: RocketRange[] = ['Earth', 'Moon', 'Mars'];
const EMPTY_FORM: RocketRequest = { name: '', capacity: 1, range: 'Earth' };

function RocketForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Rocket;
  onSubmit: (request: RocketRequest) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<RocketRequest>(
    initial ? { name: initial.name, capacity: initial.capacity, range: initial.range } : EMPTY_FORM,
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    <form className="rocket-form" onSubmit={handleSubmit} data-testid="rocket-form">
      <div className="rocket-form-row">
        <label htmlFor="rocket-name">Name</label>
        <input
          id="rocket-name"
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          data-testid="rocket-name-input"
        />
      </div>
      <div className="rocket-form-row">
        <label htmlFor="rocket-capacity">Capacity</label>
        <input
          id="rocket-capacity"
          type="number"
          min={1}
          max={9}
          value={form.capacity}
          onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
          required
          data-testid="rocket-capacity-input"
        />
      </div>
      <div className="rocket-form-row">
        <label htmlFor="rocket-range">Range</label>
        <select
          id="rocket-range"
          value={form.range}
          onChange={(e) => setForm({ ...form, range: e.target.value as RocketRange })}
          data-testid="rocket-range-input"
        >
          {RANGES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>
      {formError && (
        <p className="rocket-form-error" role="alert" data-testid="rocket-form-error">
          {formError}
        </p>
      )}
      <div className="rocket-form-actions">
        <button type="submit" disabled={isSubmitting} data-testid="rocket-submit-btn">
          {initial ? 'Update' : 'Register'}
        </button>
        <button type="button" onClick={onCancel} data-testid="rocket-cancel-btn">
          Cancel
        </button>
      </div>
    </form>
  );
}

export function RocketCatalog() {
  const { rockets, error, isLoading, create, update, decommission } = useRockets();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  if (isLoading) {
    return (
      <section className="rocket-catalog" aria-busy="true">
        <p data-testid="rockets-loading">Loading rockets…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rocket-catalog">
        <p className="rocket-error" data-testid="rockets-error" role="alert">
          Failed to load rocket catalog.
        </p>
      </section>
    );
  }

  return (
    <section className="rocket-catalog">
      <header className="rocket-catalog-header">
        <h2>Rocket Catalog</h2>
        {!isAdding && (
          <button onClick={() => setIsAdding(true)} data-testid="add-rocket-btn">
            Register Rocket
          </button>
        )}
      </header>

      {isAdding && (
        <RocketForm onSubmit={create} onCancel={() => setIsAdding(false)} />
      )}

      {rockets.length === 0 ? (
        <p data-testid="rockets-empty">No rockets registered.</p>
      ) : (
        <ul className="rocket-list">
          {rockets.map((rocket) => (
            <li key={rocket.id} className="rocket-item" data-testid="rocket-item">
              {editingId === rocket.id ? (
                <RocketForm
                  initial={rocket}
                  onSubmit={(req) => update(rocket.id, req)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div className="rocket-details">
                  <span className="rocket-name" data-testid="rocket-name">
                    {rocket.name}
                  </span>
                  <span className="rocket-meta">
                    Capacity: {rocket.capacity} · Range: {rocket.range}
                  </span>
                  <div className="rocket-actions">
                    <button onClick={() => setEditingId(rocket.id)} data-testid="edit-rocket-btn">
                      Edit
                    </button>
                    <button
                      className="rocket-decommission-btn"
                      onClick={() => void decommission(rocket.id)}
                      data-testid="decommission-rocket-btn"
                    >
                      Decommission
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
