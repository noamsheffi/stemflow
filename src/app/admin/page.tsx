"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import styles from "./admin.module.css";

type Section = "overview" | "requests" | "surveys" | "users" | "content";
type RequestStatus = "חדש" | "בבדיקה" | "אושר";

type Request = { id: string; databaseId?: string; name: string; email: string; institution: string; subject: string; date: string; status: RequestStatus; initials: string; color: string };
type OverviewData = { activeLearners30d: number; surveyResponses: number; pendingRequests: number; courseCount: number; surveys: Array<{ id: string; title: string; type: string; responses: number | null; questionnaireUrl: string }> };

const navItems: Array<{ id: Section; label: string; icon: string; count?: number }> = [
  { id: "overview", label: "סקירה כללית", icon: "⌂" },
  { id: "requests", label: "בקשות הצטרפות", icon: "＋" },
  { id: "surveys", label: "שאלונים", icon: "☷" },
  { id: "users", label: "משתמשים", icon: "♙" },
  { id: "content", label: "תוכן וקורסים", icon: "▤" },
];

export default function AdminPage() {
  const [active, setActive] = useState<Section>("overview");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"הכול" | RequestStatus>("הכול");
  const [requestData, setRequestData] = useState<Request[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestsError, setRequestsError] = useState(false);
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [overviewError, setOverviewError] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    fetch("/api/admin/lecturer-interest", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("request failed")))
      .then((payload: { requests: Request[] }) => setRequestData(payload.requests))
      .catch(() => setRequestsError(true))
      .finally(() => setRequestsLoading(false));
    fetch("/api/admin/overview", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("request failed")))
      .then((payload: OverviewData) => setOverviewData(payload))
      .catch(() => setOverviewError(true));
  }, []);

  const filteredRequests = useMemo(() => requestData.filter((request) => {
    const matchesQuery = [request.name, request.email, request.institution, request.subject].some((value) => value.includes(query));
    return matchesQuery && (status === "הכול" || request.status === status);
  }), [query, status]);

  function selectSection(section: Section) {
    setActive(section);
    setNotice("");
  }

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2600);
  }

  return (
    <div className={styles.shell} dir="rtl">
      <aside className={styles.sidebar}>
        <div className={styles.brand}><span className={styles.brandMark}>S</span><span>Syllo<span className={styles.brandDot}>.</span></span><span className={styles.adminLabel}>ADMIN</span></div>
        <div className={styles.workspaceSwitch}><span className={styles.workspaceAvatar}>ס</span><span><strong>סביבת מנהל</strong><small>Syllo Platform</small></span><span className={styles.chevron}>⌄</span></div>
        <nav className={styles.nav} aria-label="ניווט מנהל">
          <p className={styles.navLabel}>ניהול פלטפורמה</p>
          {navItems.map((item) => { const count = item.id === "requests" ? overviewData?.pendingRequests : item.count; return <button className={`${styles.navItem} ${active === item.id ? styles.activeNav : ""}`} key={item.id} onClick={() => selectSection(item.id)}><span className={styles.navIcon}>{item.icon}</span><span>{item.label}</span>{count ? <span className={styles.navCount}>{count}</span> : null}</button>; })}
          <p className={styles.navLabel}>מערכת</p>
          <button className={styles.navItem} onClick={() => showNotice("הגדרות יהיו זמינות בגרסה הבאה") }><span className={styles.navIcon}>⚙</span><span>הגדרות</span></button>
          <button className={styles.navItem} onClick={() => showNotice("מרכז העזרה נפתח בחלון חדש") }><span className={styles.navIcon}>?</span><span>עזרה ותמיכה</span></button>
        </nav>
        <div className={styles.sidebarFooter}><div className={styles.userRow}><span className={`${styles.avatar} ${styles.avatarSmall}`}>נש</span><span><strong>נועם שפי</strong><small>מנהל מערכת</small></span><button aria-label="אפשרויות משתמש">•••</button></div></div>
      </aside>

      <main className={styles.main}>
        <header className={styles.topbar}><div className={styles.breadcrumb}><span>ניהול פלטפורמה</span><span>/</span><strong>{navItems.find((item) => item.id === active)?.label}</strong></div><div className={styles.topActions}><button className={styles.iconButton} aria-label="התראות" onClick={() => showNotice("אין התראות חדשות")}>♧<span className={styles.notificationDot} /></button><div className={styles.topUser}><span className={`${styles.avatar} ${styles.avatarSmall}`}>נש</span><span>נועם שפי</span><span>⌄</span></div></div></header>
        <div className={styles.content}>
          {notice && <div className={styles.notice} role="status"><span>✓</span>{notice}</div>}
          {active === "overview" && <Overview requests={requestData} metrics={overviewData} metricsError={overviewError} requestsLoading={requestsLoading} requestsError={requestsError} onNavigate={selectSection} onSelectRequest={setSelectedRequest} />}
          {active === "requests" && <Requests query={query} setQuery={setQuery} status={status} setStatus={setStatus} data={filteredRequests} loading={requestsLoading} error={requestsError} onSelect={setSelectedRequest} onApprove={async (request) => { await updateRequest(request); }} />}
          {active === "surveys" && <Surveys surveys={overviewData?.surveys ?? []} error={overviewError} onCreate={() => showNotice("יצירת שאלון חדש תתווסף בקרוב")} />}
          {active === "users" && <Placeholder title="משתמשים" description="ניהול מרצים, סטודנטים והרשאות גישה." icon="♙" action="הזמנת משתמש" onAction={() => showNotice("הזמנת משתמש תתווסף בקרוב")} />}
          {active === "content" && <Placeholder title="תוכן וקורסים" description="ניהול קורסים, שיעורים וחומרי לימוד בפלטפורמה." icon="▤" action="קורס חדש" onAction={() => showNotice("יצירת קורס חדש תתווסף בקרוב")} />}
        </div>
      </main>
      {selectedRequest && <RequestDrawer request={selectedRequest} onClose={() => setSelectedRequest(null)} onApprove={async () => { await updateRequest(selectedRequest); setSelectedRequest(null); showNotice("הבקשה אושרה בהצלחה"); }} />}
    </div>
  );
  async function updateRequest(request: Request) {
    try {
      if (!request.databaseId) { showNotice("הבקשה עדיין לא מחוברת לרשומה במסד הנתונים"); return; }
      const response = await fetch(`/api/admin/lecturer-interest/${request.databaseId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "אושר" }) });
      if (!response.ok) throw new Error("update failed");
      setRequestData((current) => current.map((item) => item.id === request.id ? { ...item, status: "אושר" } : item));
      showNotice("הבקשה אושרה בהצלחה");
    } catch { showNotice("לא הצלחנו לעדכן את הבקשה"); }
  }
}

function Overview({ requests, metrics, metricsError, requestsLoading, requestsError, onNavigate, onSelectRequest }: { requests: Request[]; metrics: OverviewData | null; metricsError: boolean; requestsLoading: boolean; requestsError: boolean; onNavigate: (section: Section) => void; onSelectRequest: (request: Request) => void }) {
  const date = new Intl.DateTimeFormat("he-IL", { dateStyle: "full", timeZone: "Asia/Jerusalem" }).format(new Date());
  return <>
    <div className={styles.pageHeading}><div><p className={styles.eyebrow}>{date}</p><h1>שלום, נועם <span>👋</span></h1><p className={styles.headingSub}>נתונים ממסד הנתונים של Syllo.</p></div><button className={styles.primaryButton} onClick={() => onNavigate("surveys")}><span>＋</span> שאלונים</button></div>
    {metricsError && <div className={styles.emptyState} role="alert">לא ניתן לטעון נתונים כרגע. המדדים מוצגים ללא ערכים כדי לא להציג מידע שגוי.</div>}
    <section className={styles.statGrid} aria-label="מדדים מרכזיים">
      <Stat label="לומדים פעילים · 30 יום" value={metrics ? String(metrics.activeLearners30d) : "—"} change="" icon="♙" tone="blue" detail="מזהים אנונימיים באירועי למידה" />
      <Stat label="תשובות לשאלונים" value={metrics ? String(metrics.surveyResponses) : "—"} change="" icon="☷" tone="purple" detail="בכל השאלונים המחוברים" />
      <Stat label="בקשות פתוחות" value={metrics ? String(metrics.pendingRequests) : "—"} change="" icon="＋" tone="orange" detail="חדשות ובבדיקה" />
      <Stat label="קורסים רשומים" value={metrics ? String(metrics.courseCount) : "—"} change="" icon="▤" tone="teal" detail="בקטלוג הקורסים של Syllo" />
    </section>
    <section className={styles.panel}>
      <div className={styles.panelHeading}><div><h2>תשובות לפי שאלון</h2><p>ספירה מתוך התשובות שנשמרו במסד הנתונים</p></div><button className={styles.textButton} onClick={() => onNavigate("surveys")}>לכל השאלונים</button></div>
      {metricsError ? <div className={styles.emptyState}>לא ניתן לטעון את ספירת התשובות כרגע.</div> : !metrics ? <div className={styles.emptyState}>טוען נתוני שאלונים…</div> : <><div className={styles.responseList}>{metrics.surveys.map((survey) => <div className={styles.responseRow} key={survey.id}><span className={styles.responseIcon}>☷</span><span className={styles.responseName}><strong>{survey.title}</strong><small>{survey.type}</small></span><strong className={styles.responseCount}>{survey.responses ?? "—"}</strong><span className={styles.responseLabel}>{survey.responses === null ? "לא הוגדר" : "תשובות"}</span></div>)}</div>{metrics.surveys.some((survey) => survey.responses === null) && <p className={styles.surveyNotice}>חלק מטבלאות השאלונים עדיין לא הוגדרו במסד הנתונים.</p>}</>}
    </section>
    <section className={styles.panel}><div className={styles.panelHeading}><div><h2>בקשות הצטרפות אחרונות</h2><p>בקשות שנשמרו בפועל</p></div><button className={styles.textButton} onClick={() => onNavigate("requests")}>לניהול בקשות</button></div>{requestsError ? <div className={styles.emptyState}>לא ניתן לטעון בקשות כרגע.</div> : requestsLoading ? <div className={styles.emptyState}>טוען בקשות…</div> : requests.length === 0 ? <div className={styles.emptyState}>עדיין לא התקבלו בקשות הצטרפות.</div> : <div className={styles.tableWrap}><RequestTable data={requests.slice(0, 4)} onSelect={onSelectRequest} /></div>}</section>
  </>;
}

function Stat({ label, value, change, icon, tone, detail }: { label: string; value: string; change: string; icon: string; tone: string; detail: string }) { return <article className={styles.statCard}><div className={`${styles.statIcon} ${styles[tone]}`}>{icon}</div><div className={styles.statCopy}><p>{label}</p><strong>{value}</strong><span className={styles.statChange}>{change}</span><small>{detail}</small></div></article>; }
function ActionRow({ icon, tone, title, subtitle, onClick }: { icon: string; tone: string; title: string; subtitle: string; onClick: () => void }) { return <button className={styles.actionRow} onClick={onClick}><span className={`${styles.actionIcon} ${styles[tone]}`}>{icon}</span><span><strong>{title}</strong><small>{subtitle}</small></span></button>; }

function Requests({ query, setQuery, status, setStatus, data, loading, error, onSelect, onApprove }: { query: string; setQuery: (v: string) => void; status: "הכול" | RequestStatus; setStatus: (v: "הכול" | RequestStatus) => void; data: Request[]; loading: boolean; error: boolean; onSelect: (request: Request) => void; onApprove: (request: Request) => Promise<void> }) { return <><div className={styles.pageHeading}><div><p className={styles.eyebrow}>ניהול פלטפורמה</p><h1>בקשות הצטרפות</h1><p className={styles.headingSub}>בקשות אמיתיות שנשמרו במסד הנתונים.</p></div><button className={styles.secondaryButton} onClick={() => alert("ייצוא יתווסף בקרוב")}>ייצוא CSV</button></div><section className={styles.panel}><div className={styles.toolbar}><label className={styles.search}><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="חיפוש לפי שם, מוסד או קורס" /></label><div className={styles.filters}>{(["הכול", "חדש", "בבדיקה", "אושר"] as const).map((item) => <button key={item} className={status === item ? styles.filterActive : ""} onClick={() => setStatus(item)}>{item}{item === "חדש" && <b>{data.filter((request) => request.status === "חדש").length}</b>}</button>)}</div></div>{error ? <div className={styles.emptyState} role="alert">טעינת הבקשות נכשלה. לא מוצגים נתוני דוגמה.</div> : loading ? <div className={styles.emptyState}>טוען בקשות…</div> : <><div className={styles.tableWrap}><RequestTable data={data} onSelect={onSelect} onApprove={onApprove} /></div>{data.length === 0 && <div className={styles.emptyState}>לא נמצאו בקשות התואמות לסינון.</div>}<div className={styles.tableFooter}><span>מוצגות {data.length} בקשות</span></div></>}</section></>; }

function RequestTable({ data, onSelect, onApprove }: { data: Request[]; onSelect: (request: Request) => void; onApprove?: (request: Request) => Promise<void> }) { return <table className={styles.dataTable}><thead><tr><th>מבקש/ת</th><th>מוסד</th><th>קורס</th><th>התקבל</th><th>סטטוס</th><th aria-label="פעולות" /></tr></thead><tbody>{data.map((request) => <tr key={request.id} onClick={() => onSelect(request)}><td><div className={styles.person}><span className={`${styles.avatar} ${styles[request.color]}`}>{request.initials}</span><span><strong>{request.name}</strong><small>{request.email}</small></span></div></td><td>{request.institution}</td><td>{request.subject}</td><td className={styles.muted}>{request.date}</td><td><span className={`${styles.status} ${styles[`status${request.status}`]}`}>{request.status}</span></td><td><button className={styles.moreButton} aria-label={`פעולות עבור ${request.name}`} onClick={(event) => { event.stopPropagation(); void onApprove?.(request); }}>•••</button></td></tr>)}</tbody></table>; }

function Surveys({ surveys, error, onCreate }: { surveys: OverviewData["surveys"]; error: boolean; onCreate: () => void }) { return <><div className={styles.pageHeading}><div><p className={styles.eyebrow}>ניהול תוכן</p><h1>שאלונים</h1><p className={styles.headingSub}>קישורים לשאלונים ולסיכום התשובות שנשמרו בפועל.</p></div><button className={styles.primaryButton} onClick={onCreate}><span>＋</span> שאלון חדש</button></div>{error ? <div className={styles.emptyState}>לא ניתן לטעון נתוני שאלונים. לא מוצגים נתוני דוגמה.</div> : <section className={styles.panel}><div className={styles.tableWrap}><table className={styles.dataTable}><thead><tr><th scope="col">שאלון</th><th scope="col">סוג</th><th scope="col">תשובות</th><th scope="col">מצב</th><th scope="col">קישורים</th></tr></thead><tbody>{surveys.map((survey, index) => <tr key={survey.id}><td><div className={styles.surveyTableName}><span className={`${styles.surveyNumber} ${[styles.cyan, styles.violet, styles.amber][index]}`}>{String(index + 1).padStart(2, "0")}</span><span><strong>{survey.title}</strong><small>{survey.id}</small></span></div></td><td>{survey.type}</td><td><strong>{survey.responses ?? "—"}</strong></td><td><span className={`${styles.surveyState} ${survey.responses === null ? styles.surveyUnavailable : styles.surveyAvailable}`}>{survey.responses === null ? "טבלה לא הוגדרה" : "פעיל"}</span></td><td><div className={styles.surveyLinks}><Link href={`/admin/surveys/${survey.id}`}>סיכום תשובות</Link><Link href={survey.questionnaireUrl} target="_blank" rel="noreferrer">פתיחת השאלון ↗</Link></div></td></tr>)}</tbody></table></div></section>}</>; }
function Placeholder({ title, description, icon, action, onAction }: { title: string; description: string; icon: string; action: string; onAction: () => void }) { return <div className={styles.placeholder}><div className={styles.placeholderIcon}>{icon}</div><p className={styles.eyebrow}>בקרוב</p><h1>{title}</h1><p>{description}</p><button className={styles.primaryButton} onClick={onAction}><span>＋</span>{action}</button></div>; }
function RequestDrawer({ request, onClose, onApprove }: { request: Request; onClose: () => void; onApprove: () => Promise<void> }) { return <div className={styles.drawerBackdrop} onClick={onClose}><aside className={styles.drawer} onClick={(event) => event.stopPropagation()}><div className={styles.drawerTop}><button className={styles.closeButton} onClick={onClose}>×</button><span className={`${styles.status} ${styles[`status${request.status}`]}`}>{request.status}</span></div><div className={styles.drawerProfile}><span className={`${styles.avatar} ${styles[request.color]} ${styles.avatarLarge}`}>{request.initials}</span><h2>{request.name}</h2><p>{request.email}</p></div><div className={styles.detailList}><div><span>מוסד</span><strong>{request.institution}</strong></div><div><span>קורס</span><strong>{request.subject}</strong></div><div><span>מספר בקשה</span><strong dir="ltr">{request.id}</strong></div><div><span>התקבלה</span><strong>{request.date}</strong></div></div><div className={styles.drawerActions}><button className={styles.primaryButton} onClick={() => void onApprove()}>אישור בקשה</button><button className={styles.secondaryButton} onClick={onClose}>סגירה</button></div></aside></div>; }
