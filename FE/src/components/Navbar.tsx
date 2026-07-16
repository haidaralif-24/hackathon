import { LogOut, MessageCircle, ChevronDown } from "lucide-react";
import { useLocation } from "react-router-dom";

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  "/": { title: "Welcome back!", subtitle: "Here's what you can do today." },
  "/chat": {
    title: "AI Chat Assistant",
    subtitle: "Get answers. Understand your health. Find care.",
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
}

export default function Navbar({ email, onSignOut }: NavbarProps) {
  userName?: string;
  userAvatar?: string;
}

export default function Navbar({ email, userName, userAvatar }: NavbarProps) {
  const location = useLocation();
  const meta = pageMeta[location.pathname] || pageMeta["/"];

  return (
    <nav className="sticky top-0 z-30 w-full bg-white shadow-sm px-6 h-16">
      <div className="flex items-center justify-end gap-3 h-full">
        <div className="relative">
          <MessageCircle className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Consult your condition now!"
            className="w-48 pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <span className="text-sm text-gray-500 hidden sm:inline">{email}</span>
        <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-sm font-medium text-gray-600">
          {email.charAt(0).toUpperCase()}
        <div className="flex items-center gap-4">
          <div className="relative">
            <MessageCircle className="w-5 h-5 text-gray-500 hover:text-[#2F6FED] cursor-pointer transition-colors" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#2F6FED] rounded-full border-2 border-white" />
          </div>
          <div className="flex items-center gap-2.5">
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
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </div>
        </div>
        <button
          onClick={onSignOut}
          className="text-gray-400 hover:text-red-500 transition-colors"
          aria-label="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
}
