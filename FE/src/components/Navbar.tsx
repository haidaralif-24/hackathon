import { LogOut, MessageCircle, ChevronDown, Menu } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useLanguage } from "../contexts/LanguageContext";

const pageMeta: Record<string, { titleKey: string; subKey: string }> = {
  "/": { titleKey: "nav_welcome", subKey: "nav_welcome_sub" },
  "/chat": { titleKey: "nav_chat", subKey: "nav_chat_sub" },
  "/journal": { titleKey: "nav_journal", subKey: "nav_journal_sub" },
  "/health-record": {
    titleKey: "nav_health_record",
    subKey: "nav_health_record_sub",
  },
  "/account": { titleKey: "nav_account", subKey: "nav_account_sub" },
};

interface NavbarProps {
  email: string;
  onSignOut: () => void;
  userName?: string;
  userAvatar?: string;
  onToggleSidebar: () => void;
}

export default function Navbar({
  email,
  onSignOut,
  userName,
  userAvatar,
  onToggleSidebar,
}: NavbarProps) {
  const { t, lang, setLang } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const firstName = userName?.split(" ")[0] || "there";
  const meta = pageMeta[location.pathname] || pageMeta["/"];
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-sm border-b border-[#E5E7EB] h-16">
      <div className="flex items-center justify-between h-full px-4 md:ps-20 lg:ps-70">
        <button
          onClick={onToggleSidebar}
          className="md:hidden text-gray-500 hover:text-gray-700 mr-3 cursor-pointer"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <a
          href="/"
          className="w-7 h-7 rounded-lg overflow-hidden shrink-0 inline md:hidden mr-3 md:mr-0"
        >
          <img
            src="/BenHealthy.png"
            alt="Ben Healthy"
            className="w-full h-full object-cover"
          />
        </a>
        <div className="flex-1 lg:flex-none">
          <h1 className="text-xl font-bold text-[#111827] ">
            {t(meta.titleKey)}
            {location.pathname === "/" && (
              <>
                <span className="inline md:hidden">, {firstName}!</span>
                <span className="hidden md:inline">, {userName}!</span>
              </>
            )}
          </h1>
          <p className="text-xs text-[#6B7280] hidden md:block">
            {t(meta.subKey)}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Language toggle */}
          <button
            onClick={() => setLang(lang === "id" ? "en" : "id")}
            className="text-xs font-semibold px-2 py-1 rounded-md border border-[#E5E7EB] text-gray-500 hover:text-[#2F6FED] hover:border-[#2F6FED] transition-colors cursor-pointer"
            aria-label="Toggle language"
          >
            {lang === "id" ? "EN" : "ID"}
          </button>

          <div className="relative">
            <MessageCircle
              className="w-5 h-5 text-gray-500 hover:text-[#2F6FED] cursor-pointer transition-colors"
              onClick={() => navigate("/chat")}
            />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#2F6FED] rounded-full border-2 border-white" />
          </div>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full overflow-hidden">
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-[#EAF1FE] flex items-center justify-center text-sm font-semibold text-[#2F6FED]">
                    {(userName || email).charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <span className="hidden md:inline text-sm font-medium text-gray-700">
                {userName || email}
              </span>
              <ChevronDown
                className={`hidden lg:block w-3.5 h-3.5 text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
              />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-[#E5E7EB] shadow-lg py-1 z-50">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onSignOut();
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  {t("account_sign_out")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
