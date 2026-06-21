import type { ComponentChildren } from "preact";
import { Download, ReceiptText } from "lucide-preact";
import { Button } from "../components/ui/Button";

type AppShellProps = {
  actions: ComponentChildren;
  children: ComponentChildren;
  installAvailable: boolean;
  onInstall: () => void;
};

export function AppShell({ actions, children, installAvailable, onInstall }: AppShellProps) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span aria-hidden="true" className="brand-mark">
            <ReceiptText />
          </span>
          <div>
            <p className="eyebrow">Mobile receipt maker</p>
            <h1>Receipt Studio</h1>
          </div>
        </div>
        {installAvailable ? (
          <Button className="install-button" icon={Download} label="Install" onClick={onInstall} />
        ) : null}
      </header>

      {children}

      <nav aria-label="Print action" className="action-bar">
        {actions}
      </nav>
    </div>
  );
}
