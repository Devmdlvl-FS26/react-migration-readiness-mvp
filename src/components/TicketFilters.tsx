import { useRef, useState } from 'react';
import type { TicketStatus } from '../models/ticket';
import { useHelpdesk } from '../store/HelpdeskContext';

const statuses: Array<TicketStatus | 'All'> = ['All', 'New', 'In Progress', 'Blocked', 'Done'];

export function TicketFilters(){
  const {
    state,
    filterSummary,
    updateStatusFilter,
    toggleUrgentOnly,
    updateSearch,
    clearFilters,
    loadTickets
  } = useHelpdesk();
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="panel filters-panel">
      <div className="filters-header-row">
        <h2>Filters</h2>
        <button className="toggle-button" onClick={() => setExpanded((v) => !v)} aria-expanded={expanded}>
          <span>{expanded ? 'Hide controls' : 'Show controls'}</span>
          <span className="chevron">{expanded ? '⌃' : '⌄'}</span>
        </button>
      </div>

      {expanded && (
        <div className="controls-shell">
          <div className="filters-grid compact-grid">
            <label>
              <span>Status</span>
              <select
                value={state.selectedStatus}
                onChange={(event) => updateStatusFilter(event.target.value as TicketStatus | 'All')}
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </label>

            <label>
              <span>Search</span>
              <input
                ref={searchInputRef}
                type="text"
                value={state.searchTerm}
                onChange={(event) => updateSearch(event.target.value)}
                placeholder="organization, case, owner"
              />
            </label>

            <label className="checkbox-row compact-check">
              <input type="checkbox" checked={state.urgentOnly} onChange={toggleUrgentOnly} />
              <span>High attention only</span>
            </label>

            <div className="button-row wrap-row">
              <button onClick={clearFilters}>Clear filters</button>
              <button onClick={() => void loadTickets()}>Refresh fake endpoint</button>
              <button onClick={() => { setExpanded(true); searchInputRef.current?.focus(); }}>Focus search from parent</button>
            </div>
          </div>
          <p className="filter-summary">Current filter summary: {filterSummary}</p>
        </div>
      )}
    </section>
  );
}
