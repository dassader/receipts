import type { ComponentChildren } from "preact";
import type { LucideIcon } from "lucide-preact";

type SectionProps = {
  action?: ComponentChildren;
  children: ComponentChildren;
  icon: LucideIcon;
  title: string;
};

export function Section({ action, children, icon: Icon, title }: SectionProps) {
  return (
    <section className="form-section">
      <div className={`section-title ${action ? "split" : ""}`}>
        <div className="section-title-main">
          <Icon aria-hidden="true" />
          <h2>{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
