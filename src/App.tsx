import { useMemo, useRef } from 'react';
import { ActionLog, type ActionLogHandle } from './components/ActionLog';
import { TicketDetail } from './components/TicketDetail';
import { TicketFilters } from './components/TicketFilters';
import { TicketList } from './components/TicketList';
import { HelpdeskProvider, useHelpdesk } from './store/HelpdeskContext';

function Workspace(){
  const { clearLog, state, openCount, urgentCount, filteredTickets, loadTickets } = useHelpdesk();
  const actionLogRef = useRef<ActionLogHandle | null>(null);
  const currentDateLine = useMemo(
    () => new Intl.DateTimeFormat('en-US', { weekday: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date()),
    []
  );

  return (
    <div className="app-shell">
      <nav className="topbar panel-ribbon">
        <div className="brand-side">
          <span className="brand-kicker">Care coordination workspace</span>
          <p className="brand">Boston Triage CareOps</p>
          <p className="date-time">{currentDateLine}</p>
        </div>

        <div className="center-strip">
          <span className="framework-pill">React 19 stabilized MVP</span>
          <button onClick={() => void loadTickets()}>Refresh fake endpoint</button>
          <button onClick={clearLog}>Clear log from parent</button>
          <div className="summary-chip ok-chip"><strong>{openCount}</strong><span>Open cases</span></div>
          <div className="summary-chip warn-chip"><strong>{urgentCount}</strong><span>High attention</span></div>
          <div className="summary-chip neutral-chip"><strong>{filteredTickets.length}</strong><span>Visible after filters</span></div>
        </div>

        <div className="user-chip" aria-label="signed in operator">
          <div className="avatar" aria-hidden="true">WB</div>
          <div>
            <p className="user-label">Welcome Walter B.</p>
            <p className="user-role">Release desk operator</p>
          </div>
        </div>
      </nav>

      <TicketFilters />

      <section className="main-grid">
        <TicketList />
        <TicketDetail />
      </section>

      <ActionLog ref={actionLogRef} />
    </div>
  );
}

export default function App(){
  return (
    <HelpdeskProvider>
      <Workspace />
    </HelpdeskProvider>
  );
}
