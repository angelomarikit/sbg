import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { localAssets } from "@/config/assets";
import { DISCLAIMERS } from "@/config/theme";
import { fetchSiteSettings } from "@/services/cmsService";

export function SiteFooter() {
  const { data: settings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: fetchSiteSettings,
  });

  const policies = (settings?.policies ?? {}) as Record<string, string>;

  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-2 lg:grid-cols-4 md:px-6">
        <div className="space-y-3">
          <img src={settings?.logo_url ?? localAssets.brand.logo} alt="" className="h-14 w-auto md:h-16" />
          <p className="text-sm text-muted">
            {settings?.footer_description ??
              "Authorized Salveo affiliate — explore products for everyday wellness."}
          </p>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-bold text-deep">Products</h3>
          <ul className="space-y-2 text-sm text-muted">
            <li>
              <a href="#products" className="hover:text-primary">
                Shop all products
              </a>
            </li>
            <li>
              <a href="#promos" className="hover:text-primary">
                Promotional packages
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-bold text-deep">Support</h3>
          <ul className="space-y-2 text-sm text-muted">
            {settings?.contact_phone && <li>{settings.contact_phone}</li>}
            {settings?.contact_email && <li>{settings.contact_email}</li>}
            <li>
              <Link to="/order-status/demo" className="hover:text-primary">
                Track order
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-bold text-deep">Policies</h3>
          <ul className="space-y-2 text-sm text-muted">
            <li>{policies.privacy ?? "Privacy Policy (configure in admin)"}</li>
            <li>{policies.terms ?? "Terms & Conditions"}</li>
            <li>{policies.shipping ?? "Shipping Policy"}</li>
            <li>{policies.refund ?? "Refund Policy"}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border bg-surface px-4 py-4 md:px-6">
        <div className="mx-auto max-w-7xl space-y-2 text-xs text-muted">
          <p>{settings?.disclaimer ?? DISCLAIMERS.footer}</p>
          <p className="font-semibold text-deep">{DISCLAIMERS.therapeutic}</p>
        </div>
      </div>
    </footer>
  );
}
