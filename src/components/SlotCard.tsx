import type { ReactNode } from 'react';

interface SlotCardProps {
  titleSlot?: ReactNode;
  children: ReactNode;
}

export function SlotCard({ titleSlot, children }: SlotCardProps){
  return (
    <section className="panel slot-card">
      <div className="panel-header-row">
        <div>{titleSlot}</div>
        <span className="chip">Projected title detected: {titleSlot ? 'Yes' : 'No'}</span>
      </div>
      <div>{children}</div>
    </section>
  );
}
