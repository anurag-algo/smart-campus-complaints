import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { LayoutDashboard, FileText, PlusCircle, UserRound, Bell, Search, Menu, X } from 'lucide-react'
import { useState } from 'react'
const links = [
  {to:'/dashboard',label:'Dashboard',icon:LayoutDashboard},
  {to:'/my-complaints',label:'My Complaints',icon:FileText},
  {to:'/new-complaint',label:'New Complaint',icon:PlusCircle},
  {to:'/profile',label:'My Profile',icon:UserRound}
]
export default function Layout() {
  const [open,setOpen] = useState(false)
  const location = useLocation()
  const heading = links.find(x=>x.to===location.pathname)?.label || 'Dashboard'
  return <div className="app-shell">
    <aside className={`sidebar ${open?'sidebar-open':''}`}>
      <div className="brand"><span className="brand-mark">R</span><span>Resolve<span className="brand-dark">Hub</span></span><button className="mobile-close" onClick={()=>setOpen(false)}><X size={18}/></button></div>
      <div className="workspace-label">WORKSPACE</div>
      <nav>{links.map(({to,label,icon:Icon})=><NavLink key={to} to={to} onClick={()=>setOpen(false)} className={({isActive})=>`nav-link ${isActive?'active':''}`}><Icon size={19}/><span>{label}</span>{label==='My Complaints'&&<span className="nav-count">4</span>}</NavLink>)}</nav>
      <div className="sidebar-bottom"><div className="help-card"><div className="help-icon">✦</div><b>Need a hand?</b><p>Our support team is here to help you.</p><a href="mailto:support@resolvehub.example">Contact support ↗</a></div><div className="user-mini"><div className="avatar">SM</div><div><b>Suresh Mewada</b><small>Citizen account</small></div><span className="dots">•••</span></div></div>
    </aside>
    {open&&<button className="scrim" onClick={()=>setOpen(false)} aria-label="Close menu"/>}
    <section className="main-area">
      <header className="topbar"><button className="mobile-menu" onClick={()=>setOpen(true)}><Menu size={20}/></button><div className="crumb">Workspace <span>/</span> <b>{heading}</b></div><div className="top-actions"><label className="top-search"><Search size={16}/><input placeholder="Search anything..." /></label><button className="icon-button" aria-label="Notifications"><Bell size={19}/><i/></button><div className="top-avatar">SM</div></div></header>
      <main className="page-content"><Outlet/></main>
      <footer className="footer">© 2026 ResolveHub <span>Making every concern count.</span></footer>
    </section>
  </div>
}