import type { ComponentChildren } from "preact";

type AppShellProps = {
  actions: ComponentChildren;
  children: ComponentChildren;
};

export function AppShell({ actions, children }: AppShellProps) {
  return (
    <div className="app-shell">
      {children}

      <nav aria-label="Print action" className="action-bar">
        {actions}
      </nav>
    </div>
  );
}
