import { useState, type FormEvent } from 'react';
import type { Ticket, TicketStatus } from '../models/ticket';
import { useHelpdesk } from '../store/HelpdeskContext';

const statuses: TicketStatus[] = ['New', 'In Progress', 'Blocked', 'Done'];
const assignees = ['Walter', 'Jose', 'Ana', 'Lucia'];

export function CaseUpdate({ ticket }: { ticket: Ticket }) {
  const { updateTicket } = useHelpdesk();
  const [status, setStatus] = useState<TicketStatus>(ticket.status);
  const [assignee, setAssignee] = useState(ticket.assignee);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  const changingToBlocked = ticket.status !== 'Blocked' && status === 'Blocked';

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setFeedback('');

    if (changingToBlocked && !note.trim()) {
      setError('An operator note is required when changing the case to Blocked.');
      return;
    }
    if (!assignee.trim()) {
      setError('Please select an owner.');
      return;
    }
    if (status === ticket.status && assignee === ticket.assignee && !note.trim()) {
      setFeedback('No changes to save.');
      return;
    }

    updateTicket(ticket.id, { status, assignee, note });
    setNote('');
    setFeedback('Case updated for this demo session.');
  }

  return (
    <form className="case-update" onSubmit={save} noValidate aria-label="Update selected case">
      <div className="detail-grid">
        <div className="read-only-field">
          <p className="field-caption">Organization</p>
          <strong>{ticket.customer}</strong>
        </div>
        <div className="field-control">
          <label htmlFor="case-owner">Owner</label>
          <select id="case-owner" value={assignee} onChange={(event) => {
            setAssignee(event.target.value);
            setFeedback('');
            setError('');
          }}>
            {assignees.map((owner) => <option key={owner} value={owner}>{owner}</option>)}
          </select>
        </div>
        <div className="field-control">
          <label htmlFor="case-status">Status</label>
          <select id="case-status" value={status} onChange={(event) => {
            setStatus(event.target.value as TicketStatus);
            setFeedback('');
            setError('');
          }}>
            {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
        <div className="read-only-field">
          <p className="field-caption">Priority</p>
          <strong>{ticket.priority}</strong>
        </div>
      </div>

      <p className="case-title">{ticket.title}</p>
      <div className="notes-block">
        <h3>Clinical operations notes</h3>
        <ul>
          {ticket.notes.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}
        </ul>
      </div>
      <div className="edit-footer">
        <div className="note-field">
          <label htmlFor="case-note">
            Operator note <span>(required only when changing to Blocked)</span>
          </label>
          <textarea id="case-note" value={note} rows={2}
            onChange={(event) => { setNote(event.target.value); setFeedback(''); setError(''); }}
            placeholder="Add a note for this update" />
        </div>
        <button type="submit">Save changes</button>
      </div>
      {error && <p className="case-error" role="alert">{error}</p>}
      {feedback && <p className="case-feedback" role="status">{feedback}</p>}
    </form>
  );
}
