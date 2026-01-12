import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Shield,
  MessageSquare,
  Package,
  FileText,
  Receipt,
  Activity,
  TrendingUp,
  PieChart,
} from "lucide-react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { LanguageSwitcherCompact } from "@/components/LanguageSwitcher";

interface NavItem {
  to: string;
  icon: any;
  labelKey: string;
  children?: NavItem[];
}

export function AppSidebar() {
  const { t } = useTranslation('common');
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const superadminNavItems: NavItem[] = [
    { to: "/", icon: LayoutDashboard, labelKey: "nav.dashboard" },
    { to: "/companies", icon: Building2, labelKey: "nav.companies" },
    { to: "/users", icon: Users, labelKey: "nav.users" },
    {
      to: "/billing",
      icon: CreditCard,
      labelKey: "nav.billing",
      children: [
        { to: "/billing", icon: Receipt, labelKey: "nav.billingOverview" },
        { to: "/billing/plans", icon: Package, labelKey: "nav.plans" },
        { to: "/billing/subscriptions", icon: Users, labelKey: "nav.subscriptions" },
        { to: "/billing/invoices", icon: FileText, labelKey: "nav.invoices" },
      ],
    },
    {
      to: "/analytics",
      icon: BarChart3,
      labelKey: "nav.analytics",
      children: [
        { to: "/analytics", icon: PieChart, labelKey: "nav.analyticsOverview" },
        { to: "/analytics/usage", icon: Activity, labelKey: "nav.usage" },
        { to: "/analytics/growth", icon: TrendingUp, labelKey: "nav.growth" },
        { to: "/analytics/companies", icon: Building2, labelKey: "nav.companiesRanking" },
      ],
    },
    { to: "/support", icon: MessageSquare, labelKey: "nav.support" },
    { to: "/system", icon: Settings, labelKey: "nav.system" },
  ];

  const accountNavItems: NavItem[] = [
    { to: "/profile", icon: User, labelKey: "nav.profile" },
  ];

  // Auto-expand menu if current path matches a child
  useEffect(() => {
    superadminNavItems.forEach((item) => {
      if (item.children) {
        const isChildActive = item.children.some(
          (child) => location.pathname === child.to || location.pathname.startsWith(child.to + "/")
        );
        if (isChildActive && !expandedMenus.includes(item.to)) {
          setExpandedMenus((prev) => [...prev, item.to]);
        }
      }
    });
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleMenu = (to: string) => {
    setExpandedMenus((prev) =>
      prev.includes(to) ? prev.filter((t) => t !== to) : [...prev, to]
    );
  };

  const renderNavItem = (item: NavItem, isChild = false) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenus.includes(item.to);
    const isActiveParent =
      hasChildren &&
      item.children?.some(
        (child) => location.pathname === child.to || location.pathname.startsWith(child.to + "/")
      );

    if (hasChildren && !isCollapsed) {
      return (
        <div key={item.to}>
          <button
            onClick={() => toggleMenu(item.to)}
            className={cn(
              "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-all font-medium text-sm",
              isActiveParent
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-5 h-5 shrink-0" />
              <span>{t(item.labelKey)}</span>
            </div>
            <ChevronDown
              className={cn(
                "w-4 h-4 transition-transform",
                isExpanded && "rotate-180"
              )}
            />
          </button>
          {isExpanded && (
            <div className="ml-4 mt-1 space-y-1 border-l-2 border-border pl-3">
              {item.children?.map((child) => renderNavItem(child, true))}
            </div>
          )}
        </div>
      );
    }

    const label = t(item.labelKey);
    return (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.to === "/" || ((item.to === "/billing" || item.to === "/analytics") && !isChild)}
        className={({ isActive }) =>
          cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all font-medium text-sm",
            isActive
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            isCollapsed && "justify-center px-2",
            isChild && "py-2 text-xs"
          )
        }
        title={isCollapsed ? label : undefined}
      >
        <item.icon className={cn("shrink-0", isChild ? "w-4 h-4" : "w-5 h-5")} />
        {!isCollapsed && <span>{label}</span>}
      </NavLink>
    );
  };

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col bg-card border-r border-border h-screen sticky top-0 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-border">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-foreground">{t('app.name').split(' ')[0]}</h1>
              <p className="text-xs text-muted-foreground">{t('roles.superadmin')}</p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center mx-auto">
            <Shield className="w-5 h-5 text-primary-foreground" />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn("shrink-0", isCollapsed && "mx-auto mt-2")}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* User Info */}
      {!isCollapsed && (
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="overflow-hidden">
              <p className="font-medium text-sm truncate">{user?.name || t('roles.superadmin')}</p>
              <p className="text-xs text-muted-foreground">{t('roles.admin')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="px-2 space-y-1">
          {!isCollapsed && (
            <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t('nav.mainMenu')}
            </p>
          )}
          {superadminNavItems.map((item) => renderNavItem(item))}
        </nav>

        <Separator className="my-4" />

        <nav className="px-2 space-y-1">
          {!isCollapsed && (
            <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t('nav.account')}
            </p>
          )}
          {accountNavItems.map((item) => renderNavItem(item))}
        </nav>
      </ScrollArea>

      {/* Language Switcher and Logout */}
      <div className="p-2 border-t border-border space-y-1">
        {!isCollapsed && (
          <div className="flex items-center justify-center py-2">
            <LanguageSwitcherCompact />
          </div>
        )}
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10",
            isCollapsed && "justify-center px-2"
          )}
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span>{t('nav.logout')}</span>}
        </Button>
      </div>
    </aside>
  );
}
