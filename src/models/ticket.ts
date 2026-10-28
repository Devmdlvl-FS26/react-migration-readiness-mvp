export type TicketStatus = 'New' | 'In Progress' | 'Blocked' | 'Done';
export type TicketPriority = 'Low' | 'Medium' | 'High';

export interface Ticket {
  id: number;
  customer: string;
  title: string;
  status: TicketStatus;
  assignee: string;
  priority: TicketPriority;
  updatedMinutesAgo: number;
  urgent: boolean;
  notes: string[];
}
