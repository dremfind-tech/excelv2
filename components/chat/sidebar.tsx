"use client";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listChats, saveChat, type ChatMeta } from "@/lib/chats";
import { 
  listRecentFiles, 
  initializeSampleFiles, 
  formatFileSize, 
  formatRelativeTime,
  type RecentFile 
} from "@/lib/recent-files";
import { 
  Plus, 
  Search, 
  Library, 
  Trash2, 
  FileSpreadsheet,
  Clock,
  Star,
  Settings,
  User,
  BarChart3,
  HelpCircle,
  MoreHorizontal,
  FolderOpen,
  Calendar,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  Home,
  LogOut,
  Crown,
  GraduationCap
} from "lucide-react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export function ChatSidebar() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<ChatMeta[]>([]);
  const [activeSection, setActiveSection] = useState<"chats" | "files" | "library">("chats");
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false); // Default to false
  const [isHydrated, setIsHydrated] = useState(false);
  
  const { data: session } = useSession();
  const router = useRouter();

  const user = session?.user;

  const handleLogout = async () => {
    await signOut({ 
      callbackUrl: '/',
      redirect: false 
    });
    router.push('/');
  };

  // Handle hydration and load localStorage value after component mounts
  useEffect(() => {
    setIsHydrated(true);
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar-collapsed');
      if (saved === 'true') {
        setIsCollapsed(true);
      }
    }
  }, []);

  // Save collapse state to localStorage
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('sidebar-collapsed', isCollapsed.toString());
    }
  }, [isCollapsed, isHydrated]);

  const refresh = () => setItems(listChats());
  const refreshFiles = () => setRecentFiles(listRecentFiles());
  
  useEffect(() => { 
    refresh(); 
    initializeSampleFiles(); // Initialize sample data if none exists
    refreshFiles();
  }, []);
  
  useEffect(() => {
    const onStorage = (e: StorageEvent) => { 
      if (e.key === "viz:chats") refresh(); 
      if (e.key === "viz:recent-files") refreshFiles();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const filtered = useMemo(() => {
    if (!q) return items;
    return items.filter((c) => c.title.toLowerCase().includes(q.toLowerCase()));
  }, [q, items]);

  const filteredFiles = useMemo(() => {
    if (!q) return recentFiles;
    return recentFiles.filter((f) => f.name.toLowerCase().includes(q.toLowerCase()));
  }, [q, recentFiles]);

  const newChat = () => {
    window.dispatchEvent(new CustomEvent("viz:new-chat"));
  };

  const openChat = (c: ChatMeta) => {
    window.dispatchEvent(new CustomEvent("viz:open-chat", { detail: c }));
  };

  const openFile = (file: RecentFile) => {
    console.log("Opening file:", file.name);
    // In a real app, this would load the file and navigate to dashboard
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-50 bg-white dark:bg-gray-900 backdrop-blur border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Back to Home"
              >
                <Home size={16} className="text-gray-600 dark:text-gray-300" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary/20 text-primary">
                <Sparkles size={18} />
              </span>
              <span className="font-semibold text-lg text-gray-900 dark:text-white">Excel Visualizer</span>
            </div>
          </div>
          <Button
            onClick={newChat}
            size="sm"
            className="bg-primary hover:bg-primary/90"
          >
            <Plus size={16} />
            <span className="ml-2">New chat</span>
          </Button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex shrink-0 flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 min-h-screen transition-all duration-300 relative z-10 ${
        isCollapsed ? 'md:w-16' : 'md:w-72 lg:w-80'
      }`}>
        {/* Header with Brand and Collapse */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary/20 text-primary">
                <Sparkles size={18} />
              </span>
              <span className="font-semibold text-lg text-gray-900 dark:text-white">Excel Visualizer</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 shrink-0"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <PanelLeftOpen size={16} className="text-gray-600 dark:text-gray-300" /> : <PanelLeftClose size={16} className="text-gray-600 dark:text-gray-300" />}
          </Button>
        </div>
        
        {/* Home Button */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <Link href="/">
            <Button 
              variant="ghost" 
              className={`w-full justify-start gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                isCollapsed ? 'px-2 justify-center' : 'px-3'
              }`}
              title="Back to Home"
            >
              <Home size={16} className="text-gray-600 dark:text-gray-300" />
              {!isCollapsed && <span className="text-gray-700 dark:text-gray-200">Back to Home</span>}
            </Button>
          </Link>
        </div>
        
        {isCollapsed ? (
          <CollapsedSidebar 
            newChat={newChat}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            user={user}
          />
        ) : (
          <SidebarContent 
            q={q}
            setQ={setQ}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            items={items}
            filtered={filtered}
            recentFiles={recentFiles}
            filteredFiles={filteredFiles}
            newChat={newChat}
            openChat={openChat}
            openFile={openFile}
            refresh={refresh}
            user={user}
            logout={handleLogout}
            router={router}
          />
        )}
      </aside>
    </>
  );
}

function SidebarContent({
  q,
  setQ,
  activeSection,
  setActiveSection,
  items,
  filtered,
  recentFiles,
  filteredFiles,
  newChat,
  openChat,
  openFile,
  refresh,
  user,
  logout,
  router,
}: {
  q: string;
  setQ: (q: string) => void;
  activeSection: "chats" | "files" | "library";
  setActiveSection: (section: "chats" | "files" | "library") => void;
  items: ChatMeta[];
  filtered: ChatMeta[];
  recentFiles: RecentFile[];
  filteredFiles: RecentFile[];
  newChat: () => void;
  openChat: (c: ChatMeta) => void;
  openFile: (f: RecentFile) => void;
  refresh: () => void;
  user: any;
  logout: () => void;
  router: any;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <Button className="w-full justify-start gap-2 bg-primary hover:bg-primary/90 text-white" onClick={newChat}>
          <Plus size={16} /> New chat
        </Button>
        
        {/* Dashboard Stats */}
        <div className="mt-3">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2">
            <BarChart3 size={14} />
            Dashboard Stats
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm bg-gray-50 dark:bg-gray-800 rounded-lg p-2 border border-gray-100 dark:border-gray-700">
              <div>
                <div className="font-medium capitalize text-gray-900 dark:text-white flex items-center gap-1">
                  {/* Plan Badge */}
                  {user?.plan && (
                    <span className="flex-shrink-0">
                      {user.plan.toLowerCase() === 'free' || user.plan.toLowerCase() === 'starter' ? (
                        <GraduationCap size={12} className="text-blue-500" />
                      ) : user.plan.toLowerCase() === 'pro' ? (
                        <Crown size={12} className="text-yellow-500" />
                      ) : user.plan.toLowerCase() === 'pro plus' || user.plan.toLowerCase() === 'enterprise' ? (
                        <span className="text-xs">👑</span>
                      ) : null}
                    </span>
                  )}
                  <span>{user?.plan || 'Free'}</span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Billing: monthly</div>
              </div>
              <div className="text-primary">Plan</div>
            </div>
            <div className="flex items-center justify-between text-sm bg-gray-50 dark:bg-gray-800 rounded-lg p-2 border border-gray-100 dark:border-gray-700">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">72 / 100</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Renews in 18 days</div>
              </div>
              <div className="text-primary">Credits</div>
            </div>
            <div className="flex items-center justify-between text-sm bg-gray-50 dark:bg-gray-800 rounded-lg p-2 border border-gray-100 dark:border-gray-700">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">{recentFiles.length}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">6 this week</div>
              </div>
              <div className="text-primary">Files</div>
            </div>
            <div className="flex items-center justify-between text-sm bg-gray-50 dark:bg-gray-800 rounded-lg p-2 border border-gray-100 dark:border-gray-700">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">128</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">+12 this week</div>
              </div>
              <div className="text-primary">Charts</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 pb-0">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500" size={14} />
          <Input 
            className="pl-9 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-primary/50 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400" 
            placeholder={`Search ${activeSection}...`} 
            value={q} 
            onChange={(e) => setQ(e.target.value)} 
          />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="px-4 pt-4">
        <div className="flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
          {[
            { key: "chats", label: "Chats", icon: Library, count: items.length },
            { key: "files", label: "Files", icon: FileSpreadsheet, count: recentFiles.length },
            { key: "library", label: "Library", icon: Star, count: 0 }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveSection(tab.key as any)}
              className={`flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded text-xs font-medium transition-colors ${
                activeSection === tab.key
                  ? 'bg-primary text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <tab.icon size={12} />
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-[10px]">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeSection === "chats" && (
          <div className="flex-1 overflow-auto p-4 pt-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">Recent Chats</h3>
              {filtered.length > 0 && (
                <span className="text-xs text-muted">{filtered.length}</span>
              )}
            </div>
            
            {filtered.length === 0 && (
              <div className="text-center py-8">
                <Library className="mx-auto mb-3 text-muted" size={32} />
                <p className="text-sm text-muted mb-2">No chats yet</p>
                <p className="text-xs text-muted">Start a conversation to see your chat history</p>
              </div>
            )}
            
            <div className="space-y-1">
              {filtered.map((c) => (
                <button 
                  key={c.id} 
                  className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-white/5 active:bg-white/10 flex items-start justify-between group transition-colors" 
                  onClick={() => openChat(c)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate text-sm">{c.title}</div>
                    <div className="text-xs text-muted mt-0.5">
                      {formatRelativeTime(c.createdAt)}
                    </div>
                  </div>
                  <button 
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/20 rounded"
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      localStorage.setItem("viz:chats", JSON.stringify(items.filter((x) => x.id !== c.id))); 
                      refresh(); 
                    }}
                  >
                    <Trash2 size={12} className="text-red-400" />
                  </button>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeSection === "files" && (
          <div className="flex-1 overflow-auto p-4 pt-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">Recent Files</h3>
              {filteredFiles.length > 0 && (
                <span className="text-xs text-muted">{filteredFiles.length}</span>
              )}
            </div>
            
            {filteredFiles.length === 0 && (
              <div className="text-center py-8">
                <FileSpreadsheet className="mx-auto mb-3 text-muted" size={32} />
                <p className="text-sm text-muted mb-2">No files uploaded</p>
                <p className="text-xs text-muted">Upload data files (Excel, CSV, TSV, ODS) to start creating visualizations</p>
              </div>
            )}
            
            <div className="space-y-2">
              {filteredFiles.map((file) => (
                <button
                  key={file.id}
                  onClick={() => openFile(file)}
                  className="w-full text-left p-3 rounded-lg hover:bg-white/5 active:bg-white/10 border border-white/5 hover:border-white/10 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <FileSpreadsheet size={16} className="text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                        {file.name}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted">
                        <span>{formatRelativeTime(file.uploadedAt)}</span>
                        <span>•</span>
                        <span>{formatFileSize(file.size)}</span>
                        {file.chartCount > 0 && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <BarChart3 size={10} />
                              {file.chartCount} charts
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <MoreHorizontal size={14} className="text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeSection === "library" && (
          <div className="flex-1 overflow-auto p-4 pt-2">
            <div className="text-center py-12">
              <Star className="mx-auto mb-4 text-muted" size={40} />
              <h3 className="text-sm font-medium mb-2">Your Library</h3>
              <p className="text-xs text-muted mb-4">Save templates, favorite charts, and reusable datasets</p>
              <Button variant="ghost" size="sm" className="text-primary">
                Browse Templates
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/settings" className="flex-shrink-0">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center overflow-hidden hover:bg-primary/30 transition-colors cursor-pointer" title="Profile Settings">
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name || user.email} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={14} className="text-primary" />
                )}
              </div>
            </Link>
            <Link href="/settings" className="flex-1 min-w-0">
              <div className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg p-1 -m-1 transition-colors">
                <div className="text-sm font-medium truncate text-gray-900 dark:text-white flex items-center gap-1">
                  {/* Plan Badge */}
                  {user?.plan && (
                    <span className="flex-shrink-0">
                      {user.plan.toLowerCase() === 'free' || user.plan.toLowerCase() === 'starter' ? (
                        <GraduationCap size={14} className="text-blue-500" />
                      ) : user.plan.toLowerCase() === 'pro' ? (
                        <Crown size={14} className="text-yellow-500" />
                      ) : user.plan.toLowerCase() === 'pro plus' || user.plan.toLowerCase() === 'enterprise' ? (
                        <span className="text-sm">👑</span>
                      ) : null}
                    </span>
                  )}
                  <span className="truncate">
                    {user?.name || user?.email || 'Guest'}
                  </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {user?.plan || 'Free'} Plan
                </div>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-1">
            <button 
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" 
              title="Logout"
              onClick={() => {
                logout();
              }}
            >
              <LogOut size={16} className="text-gray-600 dark:text-gray-300" />
            </button>
            <Link href="/settings">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" title="Settings">
                <Settings size={16} className="text-gray-600 dark:text-gray-300" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function CollapsedSidebar({ 
  newChat, 
  activeSection, 
  setActiveSection,
  user
}: { 
  newChat: () => void;
  activeSection: "chats" | "files" | "library";
  setActiveSection: (section: "chats" | "files" | "library") => void;
  user: any;
}) {
  const router = useRouter();
  return (
    <div className="flex flex-col h-full">
      {/* Brand Icon */}
      <div className="p-2 border-b border-gray-200 dark:border-gray-700">
        <div className="w-full p-3 flex items-center justify-center">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary/20 text-primary">
            <Sparkles size={18} />
          </span>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="p-2">
        <Button
          onClick={newChat}
          size="sm"
          className="w-full p-2 bg-primary hover:bg-primary/90 text-white"
          title="New chat"
        >
          <Plus size={16} />
        </Button>
      </div>

      {/* Navigation Icons */}
      <div className="flex flex-col gap-1 p-2">
        <button
          onClick={() => setActiveSection("chats")}
          className={`w-full p-3 rounded-lg transition-colors flex items-center justify-center ${
            activeSection === "chats" ? "bg-primary/20 text-primary" : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
          }`}
          title="Chats"
        >
          <BarChart3 size={16} />
        </button>
        
        <button
          onClick={() => setActiveSection("files")}
          className={`w-full p-3 rounded-lg transition-colors flex items-center justify-center ${
            activeSection === "files" ? "bg-primary/20 text-primary" : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
          }`}
          title="Files"
        >
          <FileSpreadsheet size={16} />
        </button>
        
        <button
          onClick={() => setActiveSection("library")}
          className={`w-full p-3 rounded-lg transition-colors flex items-center justify-center ${
            activeSection === "library" ? "bg-primary/20 text-primary" : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
          }`}
          title="Library"
        >
          <Library size={16} />
        </button>
      </div>

      {/* Footer Icons */}
      <div className="mt-auto border-t border-gray-200 dark:border-gray-700 p-2">
        <div className="flex flex-col gap-1">
          <button 
            onClick={() => router.push('/settings')}
            className="w-full p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center" 
            title="Help & Settings"
          >
            <HelpCircle size={16} className="text-gray-600 dark:text-gray-400" />
          </button>
          <Link href="/settings">
            <button className="w-full p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center" title="Settings">
              <Settings size={16} className="text-gray-600 dark:text-gray-400" />
            </button>
          </Link>
          <Link href="/settings" className="w-full">
            <div className="w-full p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center cursor-pointer" title="Profile Settings">
              <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name || user.email} 
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <User size={12} className="text-primary" />
                )}
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

