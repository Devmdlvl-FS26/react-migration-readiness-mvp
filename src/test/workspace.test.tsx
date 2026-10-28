import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { getTickets } from '../services/fakeTicketApi';
import { freshTickets } from './ticket-fixtures';

// Only the simulated external data boundary is mocked. Components, Context,
// reducer, filters and Case Update all run as written in the application.
vi.mock('../services/fakeTicketApi', () => ({ getTickets: vi.fn() }));

beforeEach(() => {
  vi.mocked(getTickets).mockImplementation(async () => freshTickets());
});

async function start() {
  const user = userEvent.setup();
  render(<App />);
  await screen.findByRole('button', { name: /#101 / });
  return user;
}

function caseForm() {
  return within(screen.getByRole('form', { name: 'Update selected case' }));
}

function caseRow(id: number): HTMLElement {
  return screen.getByRole('button', { name: new RegExp(`#${id} `) });
}

function openCases(): string | null {
  return screen.getByText('Open cases').previousElementSibling?.textContent ?? null;
}

function visibleCases(): string | null {
  return screen.getByText('Visible after filters').previousElementSibling?.textContent ?? null;
}

function filterPanel() {
  const heading = screen.getByRole('heading', { name: 'Filters' });
  const panel = heading.closest('section');
  if (!panel) throw new Error('Filters panel is missing');
  return within(panel);
}

describe('React workspace (real components, Context and reducer)', () => {
  it('loads five cases and displays the initial counts and selected case', async () => {
    await start();
    expect(getTickets).toHaveBeenCalledTimes(1);
    expect(openCases()).toBe('4');
    expect(visibleCases()).toBe('5');
    expect(caseForm().getByLabelText('Owner')).toHaveValue('Walter');
    expect(caseForm().getByLabelText('Status')).toHaveValue('Blocked');
  });

  it('combines high-attention and search filters', async () => {
    const user = await start();
    await user.click(screen.getByRole('button', { name: /Show controls/ }));
    await user.click(filterPanel().getByLabelText('High attention only'));
    await user.type(filterPanel().getByLabelText('Search'), 'Meridian');
    expect(caseRow(103)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /#101 / })).not.toBeInTheDocument();
    expect(visibleCases()).toBe('1');
    await user.click(filterPanel().getByRole('button', { name: 'Clear filters' }));
    expect(visibleCases()).toBe('5');
  });

  it('keeps the selected case when a status filter excludes it', async () => {
    const user = await start();
    await user.click(caseRow(104));
    await user.click(screen.getByRole('button', { name: /Show controls/ }));
    await user.selectOptions(filterPanel().getByLabelText('Status'), 'Blocked');
    expect(visibleCases()).toBe('1');
    expect(caseRow(101)).toBeInTheDocument();
    expect(caseForm().getByLabelText('Status')).toHaveValue('Done');
  });

  it('allows changing only the owner of a Blocked case without a note', async () => {
    const user = await start();
    await user.selectOptions(caseForm().getByLabelText('Owner'), 'Jose');
    await user.click(caseForm().getByRole('button', { name: 'Save changes' }));
    expect(caseForm().getByLabelText('Owner')).toHaveValue('Jose');
    expect(within(caseRow(101)).getByText('Jose')).toBeInTheDocument();
    expect(openCases()).toBe('4');
    expect(screen.getByText(/Updated ticket #101: owner Walter -> Jose/)).toBeInTheDocument();
  });

  it('rejects New to Blocked without a note, leaving the case and log unchanged', async () => {
    const user = await start();
    await user.click(caseRow(103));
    await user.selectOptions(caseForm().getByLabelText('Status'), 'Blocked');
    await user.click(caseForm().getByRole('button', { name: 'Save changes' }));
    expect(screen.getByRole('alert')).toHaveTextContent('An operator note is required');
    expect(within(caseRow(103)).getByText('New')).toBeInTheDocument();
    expect(screen.queryByText(/Updated ticket #103:/)).not.toBeInTheDocument();
    expect(openCases()).toBe('4');
  });

  it('saves a valid Blocked transition, appends its note and logs the update', async () => {
    const user = await start();
    await user.click(caseRow(103));
    await user.selectOptions(caseForm().getByLabelText('Status'), 'Blocked');
    await user.type(caseForm().getByLabelText(/Operator note/), 'Investigating invite delivery');
    await user.click(caseForm().getByRole('button', { name: 'Save changes' }));
    expect(within(caseRow(103)).getByText('Blocked')).toBeInTheDocument();
    expect(caseForm().getByText('Investigating invite delivery')).toBeInTheDocument();
    expect(screen.getByText(/Updated ticket #103: status New -> Blocked; operator note added/))
      .toBeInTheDocument();
  });

  it('closes a Blocked case without another note and updates the open count', async () => {
    const user = await start();
    await user.click(caseRow(101));
    await user.selectOptions(caseForm().getByLabelText('Status'), 'Done');
    await user.click(caseForm().getByRole('button', { name: 'Save changes' }));
    expect(openCases()).toBe('3');
    expect(within(caseRow(101)).getByText('Done')).toBeInTheDocument();
    expect(caseForm().getByText('Check acknowledgements')).toBeInTheDocument();
  });

  it('shows No changes to save without creating an update', async () => {
    const user = await start();
    await user.click(caseForm().getByRole('button', { name: 'Save changes' }));
    expect(screen.getByRole('status')).toHaveTextContent('No changes to save.');
    expect(screen.queryByText(/Updated ticket #101:/)).not.toBeInTheDocument();
  });

  it('preserves session edits when refreshing the simulated endpoint', async () => {
    const user = await start();
    await user.selectOptions(caseForm().getByLabelText('Owner'), 'Jose');
    await user.click(caseForm().getByRole('button', { name: 'Save changes' }));
    await user.click(caseRow(103));
    await user.selectOptions(caseForm().getByLabelText('Status'), 'Done');
    await user.click(caseForm().getByRole('button', { name: 'Save changes' }));
    await user.click(screen.getByRole('button', { name: 'Refresh fake endpoint' }));
    await waitFor(() => expect(getTickets).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.getAllByText(/Loaded 5 fake tickets from endpoint simulation/)).toHaveLength(2));
    expect(openCases()).toBe('3');
    expect(within(caseRow(101)).getByText('Jose')).toBeInTheDocument();
    expect(within(caseRow(103)).getByText('Done')).toBeInTheDocument();
  });

  it('starts a fresh form draft when the selected case changes', async () => {
    const user = await start();
    await user.selectOptions(caseForm().getByLabelText('Status'), 'Done');
    await user.type(caseForm().getByLabelText(/Operator note/), 'Unsaved draft');
    await user.click(caseRow(103));
    expect(caseForm().getByLabelText('Status')).toHaveValue('New');
    expect(caseForm().getByLabelText('Owner')).toHaveValue('Ana');
    expect(caseForm().getByLabelText(/Operator note/)).toHaveValue('');
  });
});
