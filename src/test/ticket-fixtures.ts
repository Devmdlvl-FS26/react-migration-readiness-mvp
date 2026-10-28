import type { Ticket } from '../models/ticket';

const tickets: Ticket[] = [
  { id: 101, customer: 'OperaDDS Care Network', title: 'SFTP sync problem', status: 'Blocked',
    assignee: 'Walter', priority: 'High', updatedMinutesAgo: 12, urgent: true, notes: ['Check acknowledgements'] },
  { id: 102, customer: 'Northbridge Clinics', title: 'Stale counters', status: 'In Progress',
    assignee: 'Jose', priority: 'Medium', updatedMinutesAgo: 25, urgent: false, notes: ['Reproduce issue'] },
  { id: 103, customer: 'Meridian Patient Access', title: 'Provider invite missing', status: 'New',
    assignee: 'Ana', priority: 'High', updatedMinutesAgo: 4, urgent: true, notes: ['Check delivery'] },
  { id: 104, customer: 'HarborCare Revenue Ops', title: 'Report filter reset', status: 'Done',
    assignee: 'Walter', priority: 'Low', updatedMinutesAgo: 90, urgent: false, notes: ['Validated fix'] },
  { id: 105, customer: 'Atlas Clinical Services', title: 'Stale eligibility data', status: 'In Progress',
    assignee: 'Lucia', priority: 'High', updatedMinutesAgo: 33, urgent: true, notes: ['Check shared state'] }
];

export function freshTickets(): Ticket[] {
  return tickets.map(ticket => ({ ...ticket, notes: [...ticket.notes] }));
}
