export type ChatMeta = {
  id: string;
  title: string;
  createdAt: number;
};

const KEY = "viz:chats";

export function listChats(): ChatMeta[] {
  if (typeof localStorage === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveChat(meta: ChatMeta) {
  if (typeof localStorage === "undefined") return;
  const all = listChats();
  const idx = all.findIndex((c) => c.id === meta.id);
  if (idx >= 0) all[idx] = meta; else all.unshift(meta);
  localStorage.setItem(KEY, JSON.stringify(all.slice(0, 100)));
}

export function removeChat(id: string) {
  const all = listChats().filter((c) => c.id !== id);
  localStorage.setItem(KEY, JSON.stringify(all));
}

