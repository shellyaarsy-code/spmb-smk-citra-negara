import type { ReactNode } from "react";
import Link from "next/link";
import AuthLogoutLink from "./auth-logout-link";
import BrandLogo from "./brand-logo";

export type AppSidebarItem = {
  href: string;
  label: string;
  icon: ReactNode;
  active: boolean;
  disabled?: boolean;
  badge?: ReactNode;
};

type AppSidebarProps = {
  sidebarClassName: string;
  brandClassName: string;
  brandMarkClassName: string;
  brandHref: string;
  brandLabel: string;
  brandSubtitle?: string;
  brandAriaLabel: string;
  navClassName: string;
  linkClassName: string;
  navAriaLabel: string;
  items: AppSidebarItem[];
  beforeNav?: ReactNode;
  support?: ReactNode;
  logoutHref: string;
  logoutLabel: string;
  logoutIcon: ReactNode;
  logoutClassName: string;
  logoutInNav?: boolean;
  logoutMobileInNav?: boolean;
  logoWidth?: number;
};

export default function AppSidebar({
  sidebarClassName, brandClassName, brandMarkClassName, brandHref, brandLabel, brandSubtitle,
  brandAriaLabel, navClassName, linkClassName, navAriaLabel, items, beforeNav, support, logoutHref,
  logoutLabel, logoutIcon, logoutClassName, logoutInNav = false, logoutMobileInNav = false, logoWidth = 32,
}: AppSidebarProps) {
  const renderLogout = (className: string) => (
    <AuthLogoutLink className={className} href={logoutHref}>
      {logoutIcon}<span>{logoutLabel}</span>
    </AuthLogoutLink>
  );
  const logout = renderLogout(logoutClassName);
  const mobileLogout = logoutMobileInNav
    ? renderLogout(`${logoutClassName} mobile-only-logout`)
    : null;
  const desktopLogout = logoutMobileInNav
    ? renderLogout(`${logoutClassName} desktop-only-logout`)
    : logout;

  return (
    <aside className={sidebarClassName}>
      <Link className={brandClassName} href={brandHref} aria-label={brandAriaLabel}>
        <BrandLogo width={logoWidth} className={brandMarkClassName} />
        <span>{brandLabel}{brandSubtitle && <small>{brandSubtitle}</small>}</span>
      </Link>
      {beforeNav}
      <nav className={navClassName} aria-label={navAriaLabel}>
        {items.map((item) => {
          const className = item.active ? linkClassName + " active" : linkClassName;
          if (item.disabled) {
            return <span key={item.label} className={className} aria-disabled="true">{item.icon}<span>{item.label}</span></span>;
          }
          return (
            <Link key={item.label} className={className} href={item.href} aria-current={item.active ? "page" : undefined}>
              {item.icon}<span>{item.label}</span>{item.badge}
            </Link>
          );
        })}
        {logoutInNav && logout}
        {!logoutInNav && mobileLogout}
      </nav>
      {support}
      {!logoutInNav && desktopLogout}
    </aside>
  );
}