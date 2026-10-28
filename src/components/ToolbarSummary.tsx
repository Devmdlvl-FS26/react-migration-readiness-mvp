import { useHelpdesk } from '../store/HelpdeskContext';

export function ToolbarSummary(){
  const { openCount, urgentCount, filteredTickets, state } = useHelpdesk();

  return (
    <section className="summary-grid">
      <article className="summary-card">
        <span className="summary-label">Open cases</span>
        <strong>{openCount}</strong>
      </article>
      <article className="summary-card">
        <span className="summary-label">High attention</span>
        <strong>{urgentCount}</strong>
      </article>
      <article className="summary-card">
        <span className="summary-label">Visible after filters</span>
        <strong>{filteredTickets.length}</strong>
      </article>
      <article className="summary-card">
        <span className="summary-label">Endpoint status</span>
        <strong>{state.loading ? 'Loading...' : 'Ready'}</strong>
      </article>
    </section>
  );
}
