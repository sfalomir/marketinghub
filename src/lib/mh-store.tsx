import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { demoData } from "./mh-demo";
import type { Campaign, KeyDate, MhData, Person, Post, Task } from "./mh-types";

const STORAGE_KEY = "marketing-hub-data-v1";

interface Ctx {
  data: MhData;
  upsertTask: (t: Task) => void;
  removeTask: (id: string) => void;
  upsertPost: (p: Post) => void;
  removePost: (id: string) => void;
  upsertCampaign: (c: Campaign) => void;
  removeCampaign: (id: string) => void;
  upsertKeyDate: (k: KeyDate) => void;
  removeKeyDate: (id: string) => void;
  upsertPerson: (p: Person) => void;
  reset: () => void;
}

const MhContext = createContext<Ctx | null>(null);

function upsert<T extends { id: string }>(list: T[], item: T): T[] {
  return list.some((x) => x.id === item.id)
    ? list.map((x) => (x.id === item.id ? item : x))
    : [...list, item];
}

export function MhProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<MhData>(demoData);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setData(JSON.parse(raw) as MhData);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* ignore */
    }
  }, [data]);

  const value = useMemo<Ctx>(
    () => ({
      data,
      upsertTask: (t) => setData((d) => ({ ...d, tasks: upsert(d.tasks, t) })),
      removeTask: (id) => setData((d) => ({ ...d, tasks: d.tasks.filter((x) => x.id !== id) })),
      upsertPost: (p) => setData((d) => ({ ...d, posts: upsert(d.posts, p) })),
      removePost: (id) => setData((d) => ({ ...d, posts: d.posts.filter((x) => x.id !== id) })),
      upsertCampaign: (c) => setData((d) => ({ ...d, campaigns: upsert(d.campaigns, c) })),
      removeCampaign: (id) =>
        setData((d) => ({ ...d, campaigns: d.campaigns.filter((x) => x.id !== id) })),
      upsertKeyDate: (k) => setData((d) => ({ ...d, keyDates: upsert(d.keyDates, k) })),
      removeKeyDate: (id) =>
        setData((d) => ({ ...d, keyDates: d.keyDates.filter((x) => x.id !== id) })),
      upsertPerson: (p) =>
        setData((d) => {
          const byId = d.people.find((x) => x.id === p.id);
          if (byId) {
            if (byId.name === p.name && byId.role === p.role) return d;
            return { ...d, people: d.people.map((x) => (x.id === p.id ? p : x)) };
          }
          const byName = d.people.find((x) => x.name === p.name);
          if (byName) {
            if (byName.role === p.role && byName.id === p.id) return d;
            return {
              ...d,
              people: d.people.map((x) => (x.name === p.name ? { ...p, id: x.id } : x)),
            };
          }
          return { ...d, people: [...d.people, p] };
        }),
      reset: () => setData(demoData),
    }),
    [data],
  );

  return <MhContext.Provider value={value}>{children}</MhContext.Provider>;
}

export function useMh() {
  const ctx = useContext(MhContext);
  if (!ctx) throw new Error("useMh debe usarse dentro de MhProvider");
  return ctx;
}

export const newId = () => Math.random().toString(36).slice(2, 10);
