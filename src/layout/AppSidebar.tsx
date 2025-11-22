import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { ChevronDownIcon, PlugInIcon } from "../icons";
import { useSidebar } from "../context/SidebarContext";
import { useSidebarItems } from "../hooks/useSidebarItems"; // ⬅️ thêm hook role-based

export type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const othersItems: NavItem[] = [
  {
    icon: <PlugInIcon />,
    name: "Phân quyền",
    subItems: [
      { name: "Đăng nhập", path: "/signin" },
      { name: "Đăng ký", path: "/signup" },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  // Simple translation map for sidebar labels (English -> Vietnamese)
  const TRANSLATIONS: Record<string, string> = {
    Menu: "Danh mục",
    Others: "Khác",
    Students: "Sinh viên",
    "User Profile": "Hồ sơ cá nhân",
    "Phân quyền": "Phân quyền",
  };

  const t = (s?: string) => (s && TRANSLATIONS[s] ? TRANSLATIONS[s] : s || "");

  // 🚀 MENU CHẠY THEO ROLE
  const navItems = useSidebarItems();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);

  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let matched = false;

    const types = ["main", "others"] as const;
    types.forEach((t) => {
      const items = t === "main" ? navItems : othersItems;

      items.forEach((item, index) => {
        item.subItems?.forEach((s) => {
          if (isActive(s.path)) {
            setOpenSubmenu({ type: t as "main" | "others", index });
            matched = true;
          }
        });
      });
    });

    if (!matched) setOpenSubmenu(null);
  }, [location, isActive, navItems]);

  useEffect(() => {
    if (openSubmenu) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((old) => ({
          ...old,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const toggleSubmenu = (index: number, type: "main" | "others") => {
    setOpenSubmenu((prev) =>
      prev?.index === index && prev?.type === type ? null : { index, type }
    );
  };

  const renderMenuItems = (items: NavItem[], type: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((item, index) => (
        <li key={item.name}>
          {item.subItems ? (
            <button
              onClick={() => toggleSubmenu(index, type)}
              className={`menu-item transition-all duration-300 ease-in-out group ${
                openSubmenu?.index === index && openSubmenu?.type === type
                  ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                  : "text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/20"
              }`}
            >
              <span className="menu-item-icon-size">{item.icon}</span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{item.name}</span>
              )}

              {(isExpanded || isHovered) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform ${
                    openSubmenu?.index === index ? "rotate-180" : ""
                  }`}
                />
              )}
            </button>
          ) : (
            item.path && (
              <Link
                to={item.path}
                className={`menu-item transition-all duration-300 ease-in-out group ${
                  isActive(item.path)
                    ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    : "text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/20"
                }`}
              >
                <span className="menu-item-icon-size">{item.icon}</span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{item.name}</span>
                )}
              </Link>
            )
          )}

          {/* submenu */}
          {item.subItems && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${type}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.index === index && openSubmenu?.type === type
                    ? subMenuHeight[`${type}-${index}`]
                    : 0,
              }}
            >
              <ul className="ml-9 mt-2 space-y-1">
                {item.subItems.map((sub) => (
                  <li key={sub.name}>
                    <Link
                      to={sub.path}
                      className={`menu-dropdown-item transition-all duration-200 ease-in-out ${
                        isActive(sub.path)
                          ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                          : "text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/20"
                      }`}
                    >
                      {sub.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 lg:mt-0 top-0 left-0 px-5 bg-white dark:bg-slate-950
        border-r border-blue-100/50 dark:border-blue-900/30 h-screen transition-all duration-300 z-50
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="py-8 flex">
        <Link to="/">
          {isExpanded || isHovered ? (
            <img src="/images/logo/logo.svg" width={150} />
          ) : (
            <img src="/images/logo/logo-icon.svg" width={32} />
          )}
        </Link>
      </div>

      <div className="flex flex-col overflow-y-auto no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-xs uppercase mb-4 text-gray-400">
                {t("Danh mục")}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>

            <div>
              <h2 className="text-xs uppercase mb-4 text-gray-400">
                {t("Khác")}
              </h2>
              {renderMenuItems(othersItems, "others")}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
