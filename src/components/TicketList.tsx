import { useHelpdesk } from '../store/HelpdeskContext';

export function TicketList(){
  const { state, filteredTickets, selectTicket } = useHelpdesk();

  if (state.loading) {
    return (
      <section className="panel">
        <h2>Patient workflow queue</h2>
        <p className="muted">Loading fake endpoint data...</p>
      </section>
    );
  }

  if (filteredTickets.length === 0) {
    return (
      <section className="panel">
        <h2>Patient workflow queue</h2>
        <p className="muted">No cases match the current filters.</p>
      </section>
    );
  }

  return (
    <section className="panel">
      <h2>Patient workflow queue</h2>
      <div className="ticket-list scroll-shell">
        {filteredTickets.map((ticket) => (
          <button
            key={ticket.id}
            className={`ticket-row ${state.selectedTicketId === ticket.id ? 'active' : ''}`}
            onClick={() => selectTicket(ticket.id)}
            title="Selects this case and updates the detail panel."
          >
            <div>
              <strong>
                #{ticket.id} {ticket.title}
              </strong>
              <div className="muted small-text">{ticket.customer}</div>
            </div>
            <div className="ticket-meta">
              <span>{ticket.status}</span>
              <span>{ticket.assignee}</span>
              <span>{ticket.urgent ? 'High attention' : ticket.priority}</span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
