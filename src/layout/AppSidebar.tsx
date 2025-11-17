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
    name: "Authentication",
    subItems: [
      { name: "Sign In", path: "/signin" },
      { name: "Sign Up", path: "/signup" },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

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
              className={`menu-item group ${
                openSubmenu?.index === index && openSubmenu?.type === type
                  ? "menu-item-active"
                  : "menu-item-inactive"
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
                className={`menu-item group ${
                  isActive(item.path)
                    ? "menu-item-active"
                    : "menu-item-inactive"
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
                      className={`menu-dropdown-item ${
                        isActive(sub.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
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
      className={`fixed mt-16 lg:mt-0 top-0 left-0 px-5 bg-white dark:bg-gray-900
        border-r dark:border-gray-800 h-screen transition-all duration-300 z-50
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
              <h2 className="text-xs uppercase mb-4 text-gray-400">Menu</h2>
              {renderMenuItems(navItems, "main")}
            </div>

            <div>
              <h2 className="text-xs uppercase mb-4 text-gray-400">Others</h2>
              {renderMenuItems(othersItems, "others")}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
