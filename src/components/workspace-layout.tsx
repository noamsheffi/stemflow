import Link from "next/link";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return <div className="workspace-shell">
    <aside className="workspace-sidebar" aria-label="ניווט Syllo"><Link className="course-brand" href="/"><span className="course-mark course-mark-logo" aria-hidden="true" /><span><strong>Syllo</strong><small>סביבת למידה</small></span></Link><p className="course-nav-label">Syllo</p><nav className="product-nav"><Link href="/">בית</Link><Link href="/">הקורסים שלי</Link></nav></aside>
    <section className="workspace-content"><header className="workspace-mobile-header"><Link className="course-mobile-brand" href="/"><span className="course-mark course-mark-logo" aria-hidden="true" /><strong>Syllo</strong></Link><nav className="product-nav" aria-label="ניווט Syllo"><Link href="/">בית</Link><Link href="/">הקורסים שלי</Link></nav></header><main className="workspace-main">{children}</main></section>
  </div>;
}
