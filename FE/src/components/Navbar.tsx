import { LogOut, MessageCircle, ChevronDown } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  "/": { title: "Welcome!", subtitle: "Here's what you can do today." },
  "/chat": {
    title: "AI Chat Assistant",
    subtitle: "Get answers. Understand your health. Find care.",
  },
  "/journal": {
    title: "Journal",
    subtitle: "Track your mood and reflect on your day.",
  },
  "/health-record": {
    title: "Health Record",
    subtitle: "Your synced files and extracted health history.",
  },
  "/account": {
    title: "Account",
    subtitle: "Manage your profile and settings.",
  },
};

interface NavbarProps {
  email: string;
  onSignOut: () => void;
  userName?: string;
  userAvatar?: string;
}

export default function Navbar({
  onSignOut,
  email,
  userName,
  userAvatar,
}: NavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
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
      <div className="flex items-center justify-between h-full pe-6 ps-70">
        <div>
          <h1 className="text-xl font-bold text-[#111827]">
            {meta.title}
            {location.pathname == "/" && `, ${userName}!`}
          </h1>
          <p className="text-xs text-[#6B7280]">{meta.subtitle}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <MessageCircle
              className="w-5 h-5 text-gray-500 hover:text-[#2F6FED] cursor-pointer transition-colors"
              onClick={() => navigate("/chat", { state: { focus: true } })}
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
              <span className="text-sm font-medium text-gray-700">
                {userName || email}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
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
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
