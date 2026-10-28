import { SlotCard } from './SlotCard';
import { useHelpdesk } from '../store/HelpdeskContext';
import { CaseUpdate } from './CaseUpdate';

export function TicketDetail() {
  const { selectedTicket } = useHelpdesk();

  return (
    <SlotCard titleSlot={<h2>Selected care case</h2>}>
      {!selectedTicket ? (
        <p className="muted">Select a case to inspect the clinical-ops detail panel.</p>
      ) : (
        <div className="detail-shell">
          <CaseUpdate key={selectedTicket.id} ticket={selectedTicket} />
        </div>
      )}
    </SlotCard>
  );
}
