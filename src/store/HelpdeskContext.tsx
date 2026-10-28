import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode
} from 'react';
import type { Ticket, TicketStatus } from '../models/ticket';
import { getTickets } from '../services/fakeTicketApi';

type StatusFilter = TicketStatus | 'All';
type CaseChanges = { status: TicketStatus; assignee: string; note: string };
type SavedEdit = Pick<Ticket, 'status' | 'assignee' | 'notes' | 'updatedMinutesAgo'>;

interface HelpdeskState {
  tickets: Ticket[];
  caseEdits: Record<number, SavedEdit>;
  selectedStatus: StatusFilter;
  urgentOnly: boolean;
  searchTerm: string;
  selectedTicketId: number | null;
  loading: boolean;
  activityLog: string[];
}

type Action =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; payload: Ticket[] }
  | { type: 'LOAD_ERROR' }
  | { type: 'UPDATE_TICKET'; ticketId: number; changes: CaseChanges; time: string }
  | { type: 'SELECT_STATUS'; payload: StatusFilter }
  | { type: 'TOGGLE_URGENT' }
  | { type: 'SEARCH'; payload: string }
  | { type: 'SELECT_TICKET'; payload: number }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'CLEAR_LOG' }
  | { type: 'PUSH_LOG'; payload: string };

const initialState: HelpdeskState = {
  tickets: [],
  caseEdits: {},
  selectedStatus: 'All',
  urgentOnly: false,
  searchTerm: '',
  selectedTicketId: null,
  loading: false,
  activityLog: ['React workspace ready. Waiting for fake endpoint load...']
};

function reducer(state: HelpdeskState, action: Action): HelpdeskState {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, loading: true };
    case 'LOAD_ERROR':
      return { ...state, loading: false };  
    case 'LOAD_SUCCESS': {
      const nextSelectedTicketId =
        state.selectedTicketId ?? action.payload[0]?.id ?? null;
      return {
        ...state,
        loading: false,
        tickets: action.payload.map((ticket) => ({ ...ticket, ...state.caseEdits[ticket.id] })),
        selectedTicketId: nextSelectedTicketId
      };
    }
    case 'UPDATE_TICKET': {
      const current = state.tickets.find((ticket) => ticket.id === action.ticketId);
      if (!current) return state;
      const { status } = action.changes;
      const assignee = action.changes.assignee.trim();
      const note = action.changes.note.trim();
      const validStatuses: TicketStatus[] = ['New', 'In Progress', 'Blocked', 'Done'];
      if (!validStatuses.includes(status) || !assignee) return state;
      if (current.status !== 'Blocked' && status === 'Blocked' && !note) return state;
      const statusChanged = status !== current.status;
      const ownerChanged = assignee !== current.assignee;
      if (!statusChanged && !ownerChanged && !note) return state;

      const updated: Ticket = {
        ...current,
        status,
        assignee,
        notes: note ? [...current.notes, note] : current.notes,
        updatedMinutesAgo: 0
      };
      const detail = [
        statusChanged ? `status ${current.status} -> ${status}` : '',
        ownerChanged ? `owner ${current.assignee} -> ${assignee}` : '',
        note ? 'operator note added' : ''
      ].filter(Boolean).join('; ');
      return {
        ...state,
        tickets: state.tickets.map((ticket) => ticket.id === action.ticketId ? updated : ticket),
        caseEdits: {
          ...state.caseEdits,
          [action.ticketId]: {
            status: updated.status,
            assignee: updated.assignee,
            notes: [...updated.notes],
            updatedMinutesAgo: updated.updatedMinutesAgo
          }
        },
        activityLog: [...state.activityLog, `${action.time} - Updated ticket #${action.ticketId}: ${detail}.`]
      };
    }
    case 'SELECT_STATUS':
      return { ...state, selectedStatus: action.payload };
    case 'TOGGLE_URGENT':
      return { ...state, urgentOnly: !state.urgentOnly };
    case 'SEARCH':
      return { ...state, searchTerm: action.payload };
    case 'SELECT_TICKET':
      return { ...state, selectedTicketId: action.payload };
    case 'CLEAR_FILTERS':
      return { ...state, selectedStatus: 'All', urgentOnly: false, searchTerm: '' };
    case 'CLEAR_LOG':
      return { ...state, activityLog: [] };
    case 'PUSH_LOG':
      return { ...state, activityLog: [...state.activityLog, action.payload] };
    default:
      return state;
  }
}

interface HelpdeskContextValue {
  state: HelpdeskState;
  filteredTickets: Ticket[];
  selectedTicket: Ticket | null;
  openCount: number;
  urgentCount: number;
  filterSummary: string;
  loadTickets: () => Promise<void>;
  updateTicket: (ticketId: number, changes: CaseChanges) => void;
  updateStatusFilter: (status: StatusFilter) => void;
  toggleUrgentOnly: () => void;
  updateSearch: (term: string) => void;
  selectTicket: (ticketId: number) => void;
  clearFilters: () => void;
  clearLog: () => void;
}

const HelpdeskContext = createContext<HelpdeskContextValue | null>(null);

function timestamped(message: string): string {
  return `${new Date().toLocaleTimeString()} - ${message}`;
}

export function HelpdeskProvider({ children }: { children: ReactNode }){
  const [state, dispatch] = useReducer(reducer, initialState);

  const pushLog = useCallback((message: string) => {
    dispatch({ type: 'PUSH_LOG', payload: timestamped(message) });
  }, []);

  const loadTickets = useCallback(async (signal?: AbortSignal) => {
    if (signal?.aborted) return;

    dispatch({ type: 'LOAD_START' });
    pushLog('Refreshing fake endpoint data...');
    try {
      const tickets = await getTickets();
      if (signal?.aborted) return;

      dispatch({ type: 'LOAD_SUCCESS', payload: tickets });
      pushLog(`Loaded ${tickets.length} fake tickets from endpoint simulation.`);
    } catch {
      if (signal?.aborted) return;

      pushLog('Fake endpoint failed. This demo keeps the previous state.');
      dispatch({ type: 'LOAD_ERROR' });
    }
  }, [pushLog]);

  useEffect(() => {
    const controller = new AbortController();

    // Let StrictMode discard its extra development effect before starting the load.
    queueMicrotask(() => {
      if (!controller.signal.aborted) {
        void loadTickets(controller.signal);
      }
    });

    // An unmounted provider must not apply results from an in-flight load.
    return () => controller.abort();
  }, [loadTickets]);

  const updateTicket = useCallback((ticketId: number, changes: CaseChanges) => {
    dispatch({
      type: 'UPDATE_TICKET', ticketId, changes,
      time: new Date().toLocaleTimeString()
    });
  }, []);

  const filteredTickets = useMemo(() => {
    return state.tickets.filter((ticket) => {
      const matchesStatus =
        state.selectedStatus === 'All' || ticket.status === state.selectedStatus;
      const matchesUrgent = !state.urgentOnly || ticket.urgent;
      const query = state.searchTerm.trim().toLowerCase();
      const haystack = `${ticket.customer} ${ticket.title} ${ticket.assignee}`.toLowerCase();
      const matchesSearch = query.length === 0 || haystack.includes(query);
      return matchesStatus && matchesUrgent && matchesSearch;
    });
  }, [state.tickets, state.selectedStatus, state.urgentOnly, state.searchTerm]);

  const selectedTicket = useMemo(() => {
    return state.tickets.find((ticket) => ticket.id === state.selectedTicketId) ?? null;
  }, [state.tickets, state.selectedTicketId]);

  const openCount = useMemo(() => {
    return state.tickets.filter((ticket) => ticket.status !== 'Done').length;
  }, [state.tickets]);

  const urgentCount = useMemo(() => {
    return state.tickets.filter((ticket) => ticket.urgent).length;
  }, [state.tickets]);

  const filterSummary = useMemo(() => {
    const parts = [`Status: ${state.selectedStatus}`];
    parts.push(state.urgentOnly ? 'Urgent only' : 'All priorities');
    parts.push(state.searchTerm.trim() ? `Search: "${state.searchTerm.trim()}"` : 'Search: none');
    return parts.join(' | ');
  }, [state.selectedStatus, state.urgentOnly, state.searchTerm]);

  const updateStatusFilter = useCallback(
    (status: StatusFilter) => {
      dispatch({ type: 'SELECT_STATUS', payload: status });
      pushLog(`Status filter changed to ${status}.`);
    },
    [pushLog]
  );

  const toggleUrgentOnly = useCallback(() => {
    dispatch({ type: 'TOGGLE_URGENT' });
    pushLog(`Urgent only toggled.`);
  }, [pushLog]);

  const updateSearch = useCallback((term: string) => {
    dispatch({ type: 'SEARCH', payload: term });
  }, []);

  const selectTicket = useCallback(
    (ticketId: number) => {
      dispatch({ type: 'SELECT_TICKET', payload: ticketId });
      pushLog(`Selected ticket #${ticketId}.`);
    },
    [pushLog]
  );

  const clearFilters = useCallback(() => {
    dispatch({ type: 'CLEAR_FILTERS' });
    pushLog('Filters cleared from React control panel.');
  }, [pushLog]);

  const clearLog = useCallback(() => {
    dispatch({ type: 'CLEAR_LOG' });
    dispatch({ type: 'PUSH_LOG', payload: timestamped('Activity log cleared from parent action.') });
  }, []);

  const value = useMemo<HelpdeskContextValue>(
    () => ({
      state,
      filteredTickets,
      selectedTicket,
      openCount,
      urgentCount,
      filterSummary,
      loadTickets,
      updateTicket,
      updateStatusFilter,
      toggleUrgentOnly,
      updateSearch,
      selectTicket,
      clearFilters,
      clearLog
    }),
    [
      state,
      filteredTickets,
      selectedTicket,
      openCount,
      urgentCount,
      filterSummary,
      loadTickets,
      updateTicket,
      updateStatusFilter,
      toggleUrgentOnly,
      updateSearch,
      selectTicket,
      clearFilters,
      clearLog
    ]
  );

  return <HelpdeskContext.Provider value={value}>{children}</HelpdeskContext.Provider>;
}

export function useHelpdesk(): HelpdeskContextValue {
  const context = useContext(HelpdeskContext);
  if (!context) {
    throw new Error('useHelpdesk must be used inside HelpdeskProvider');
  }
  return context;
}
