import { LayoutDashboard, Package, ShoppingCart, Settings, FileText, Image, MessageSquare, CreditCard, Activity, Tag, LogOut, Menu, HelpCircle } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { adminSignOut } from "@/features/auth/AdminGuard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { localAssets } from "@/config/assets";

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/pages", label: "Landing Page", icon: FileText },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/promotions", label: "Promotions", icon: Tag },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/payments", label: "Payments", icon: CreditCard },
  { to: "/admin/media", label: "Media", icon: Image },
  { to: "/admin/testimonials", label: "Testimonials", icon: MessageSquare },
  { to: "/admin/faqs", label: "FAQs", icon: HelpCircle },
  { to: "/admin/settings", label: "Settings", icon: Settings },
  { to: "/admin/activity", label: "Activity", icon: Activity },
];

export function AdminLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface md:grid md:grid-cols-[260px_1fr]">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 border-r border-border bg-white p-4 transition-transform md:static md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-6 flex items-center gap-2">
          <img src={localAssets.brand.logo} alt="" className="h-8" />
          <span className="text-sm font-bold text-deep">Admin CMS</span>
        </div>
        <nav className="space-y-1">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
                  isActive ? "bg-fresh text-deep" : "text-muted hover:bg-surface",
                )
              }
              onClick={() => setOpen(false)}
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <Button
          variant="ghost"
          className="mt-6 w-full justify-start"
          onClick={() => adminSignOut()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </Button>
      </aside>

      <div className="min-w-0">
        <header className="flex items-center justify-between border-b border-border bg-white px-4 py-3 md:hidden">
          <button type="button" aria-label="Open admin menu" onClick={() => setOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/" className="text-sm font-medium text-primary">
            View site
          </Link>
        </header>
        <div className="hidden items-center justify-end border-b border-border bg-white px-6 py-3 md:flex">
          <Link to="/" className="text-sm font-medium text-primary hover:underline">
            View live site
          </Link>
        </div>
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          aria-label="Close menu overlay"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
}
