import type { Ticket } from '../models/ticket';

const fakeTickets: Ticket[] = [
  {
    id: 101,
    customer: 'OperaDDS Care Network',
    title: 'Legacy patient export screen not syncing to partner SFTP',
    status: 'Blocked',
    assignee: 'Walter',
    priority: 'High',
    updatedMinutesAgo: 12,
    urgent: true,
    notes: ['Nightly discharge export is missing two partner acknowledgements.', 'Need retry visibility before moving this flow to the background integration service.']
  },
  {
    id: 102,
    customer: 'Northbridge Specialty Clinics',
    title: 'Referral dashboard counters stay stale after partial AngularJS migration',
    status: 'In Progress',
    assignee: 'Jose',
    priority: 'Medium',
    updatedMinutesAgo: 25,
    urgent: false,
    notes: ['Backend response is already patched.', 'Frontend shared-state refresh still needs to react after publish.']
  },
  {
    id: 103,
    customer: 'Meridian Patient Access',
    title: 'New provider invite not arriving after intake workflow handoff',
    status: 'New',
    assignee: 'Ana',
    priority: 'High',
    updatedMinutesAgo: 4,
    urgent: true,
    notes: ['Likely related to identity-provider throttling.', 'Need logs, retry trace, and delivery confirmation in the modernization shell.']
  },
  {
    id: 104,
    customer: 'HarborCare Revenue Ops',
    title: 'Settlement report filters reset after returning from embedded patient ledger',
    status: 'Done',
    assignee: 'Walter',
    priority: 'Low',
    updatedMinutesAgo: 90,
    urgent: false,
    notes: ['Issue reproduced only on an older browser session.', 'Patch already validated in staging before rollout.']
  },
  {
    id: 105,
    customer: 'Atlas Clinical Services',
    title: 'Care-team switcher keeps stale eligibility data between patient contexts',
    status: 'In Progress',
    assignee: 'Lucia',
    priority: 'High',
    updatedMinutesAgo: 33,
    urgent: true,
    notes: ['Likely missing cache invalidation across the shared store.', 'Good case for explaining derived values and predictable UI reactions.']
  }
];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getTickets(): Promise<Ticket[]> {
  await delay(900);
  return structuredClone(fakeTickets);
}
