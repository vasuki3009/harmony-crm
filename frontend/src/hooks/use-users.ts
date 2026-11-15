import { useEffect, useState } from 'react';
import type { User } from '../types/crm';
import { mockUsers } from '../data/mockData';
import { usersApi } from '../services/usersApi';

/**
 * Returns the list of users from the API (or the mock users when no backend is configured).
 * Concurrent callers share one request, and the result is reused for a few seconds,
 * so a board with many cards does not fire one request per card.
 */
const FRESH_MS = 5000;
let cache: User[] | null = null;
let fetchedAt = 0;
let inflight: Promise<User[]> | null = null;

function loadUsers(): Promise<User[]> {
  if (cache && Date.now() - fetchedAt < FRESH_MS) return Promise.resolve(cache);
  if (!inflight) {
    inflight = usersApi
      .getAll()
      .then(list => {
        cache = list;
        fetchedAt = Date.now();
        return list;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

export function useUsers(): User[] {
  const [users, setUsers] = useState<User[]>(cache ?? mockUsers);

  useEffect(() => {
    let alive = true;
    loadUsers()
      .then(list => {
        if (alive) setUsers(list);
      })
      .catch(() => {
        /* keep the fallback list */
      });
    return () => {
      alive = false;
    };
  }, []);

  return users;
}
