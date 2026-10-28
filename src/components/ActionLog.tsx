import { forwardRef, useImperativeHandle, useRef } from 'react';
import { useHelpdesk } from '../store/HelpdeskContext';

export interface ActionLogHandle {
  scrollToLatest: () => void;
}

export const ActionLog = forwardRef<ActionLogHandle, {}>(function ActionLog(_, ref) {
  const { state } = useHelpdesk();
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useImperativeHandle(ref, () => ({
    scrollToLatest() {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }));

  return (
    <section className="panel">
      <h2>Operator activity log</h2>
      <p className="muted">This helps you see how multiple components touch the same shared store.</p>
      <div className="log-list scroll-shell short-shell">
        {state.activityLog.map((line, index) => (
          <div key={`${line}-${index}`} className="log-row">
            {line}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </section>
  );
});
