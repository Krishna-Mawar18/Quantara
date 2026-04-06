"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, X, Database, Trash2, BarChart3, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getPlanInfo } from "@/lib/api";

interface Notification {
  id: string;
  type: "success" | "info" | "warning";
  title: string;
  message: string;
  time: Date;
  icon: "database" | "trash" | "chart" | "check";
}

// Global notification store
let notifications: Notification[] = [];
let listeners: (() => void)[] = [];

export function addNotification(type: Notification["type"], title: string, message: string, icon: Notification["icon"] = "check") {
  notifications = [
    {
      id: crypto.randomUUID(),
      type,
      title,
      message,
      time: new Date(),
      icon,
    },
    ...notifications,
  ].slice(0, 20);
  listeners.forEach((l) => l());
}

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [planName, setPlanName] = useState("Free");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const listener = () => setNotifs([...notifications]);
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  useEffect(() => {
    getPlanInfo()
      .then((info) => setPlanName(info.plan))
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const clearAll = () => {
    notifications = [];
    listeners.forEach((l) => l());
  };

  const unreadCount = notifs.length;

  const dateStr = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    weekday: "short",
  });

  const iconMap = {
    database: <Database className="w-3.5 h-3.5" />,
    trash: <Trash2 className="w-3.5 h-3.5" />,
    chart: <BarChart3 className="w-3.5 h-3.5" />,
    check: <CheckCircle className="w-3.5 h-3.5" />,
  };

  const colorMap = {
    success: "bg-emerald-50 text-emerald-600",
    info: "bg-violet-50 text-violet-600",
    warning: "bg-amber-50 text-amber-600",
  };

  return (
    <header className="h-14 bg-white/80 backdrop-blur-xl border-b border-zinc-100 flex items-center justify-between px-8 sticky top-0 z-20">
      <div>
        <p className="text-[13px] text-zinc-400">{dateStr}</p>
      </div>

      <div className="flex items-center gap-3">
        <Badge variant="info" className="capitalize">
          {planName}
        </Badge>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="relative p-2 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            <Bell className="w-[18px] h-[18px]" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-violet-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {isOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-zinc-100 shadow-lg overflow-hidden animate-slide-in">
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
                <p className="text-[13px] font-semibold text-zinc-900">Notifications</p>
                {notifs.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-[11px] text-zinc-400 hover:text-zinc-600 transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifs.length === 0 ? (
                  <div className="py-8 text-center">
                    <Bell className="w-8 h-8 text-zinc-200 mx-auto mb-2" />
                    <p className="text-[13px] text-zinc-400">No notifications</p>
                  </div>
                ) : (
                  notifs.map((n) => (
                    <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-zinc-50 transition-colors border-b border-zinc-50 last:border-0">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${colorMap[n.type]}`}>
                        {iconMap[n.icon]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-zinc-900">{n.title}</p>
                        <p className="text-[11px] text-zinc-400 mt-0.5">{n.message}</p>
                        <p className="text-[10px] text-zinc-300 mt-1">
                          {n.time.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
