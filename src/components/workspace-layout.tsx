import Link from "next/link";
import LogoutButton from "./logout-button";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return <div className="workspace-shell">
    <aside className="workspace-sidebar" aria-label="ניווט Syllo"><Link className="course-brand" href="/" aria-label="Syllo — דף הבית"><img className="brand-logo" src="/brand/syllo-logo.png" alt="Syllo" width="132" height="56" /></Link><nav className="product-nav"><Link href="/">בית</Link><Link href="/workspace">הקורסים שלי</Link></nav><LogoutButton variant="sidebar" /></aside>
    <section className="workspace-content"><header className="workspace-mobile-header"><Link className="course-mobile-brand" href="/" aria-label="Syllo — דף הבית"><img className="brand-logo" src="/brand/syllo-logo.png" alt="Syllo" width="112" height="48" /></Link><nav className="product-nav" aria-label="ניווט Syllo"><Link href="/">בית</Link><Link href="/workspace">הקורסים שלי</Link><LogoutButton /></nav></header><main className="workspace-main">{children}</main></section>
  </div>;
}
