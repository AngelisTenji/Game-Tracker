import { supabase } from './supabase';

interface PendingAction {
  id: string;
  table: string;
  type: 'INSERT' | 'UPDATE' | 'DELETE' | 'UPSERT';
  payload: any;
  timestamp: number;
}

const QUEUE_KEY = 'kazechronik_sync_queue';

export function enqueueAction(table: string, type: 'INSERT' | 'UPDATE' | 'DELETE' | 'UPSERT', payload: any) {
  const currentQueue: PendingAction[] = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  
  currentQueue.push({
    id: `sync_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    table,
    type,
    payload,
    timestamp: Date.now()
  });

  localStorage.setItem(QUEUE_KEY, JSON.stringify(currentQueue));
}

export async function processSyncQueue() {
  if (!navigator.onLine) return;

  const rawQueue = localStorage.getItem(QUEUE_KEY);
  if (!rawQueue) return;

  const queue: PendingAction[] = JSON.parse(rawQueue);
  if (queue.length === 0) return;

  console.log(`[SyncQueue] Procesando ${queue.length} acciones pendientes...`);

  const remainingQueue: PendingAction[] = [];

  for (const item of queue) {
    try {
      let error = null;

      if (item.type === 'INSERT') {
        const res = await supabase.from(item.table).insert([item.payload]);
        error = res.error;
      } else if (item.type === 'UPDATE') {
        const { id, ...updateData } = item.payload;
        const res = await supabase.from(item.table).update(updateData).eq('id', id);
        error = res.error;
      } else if (item.type === 'DELETE') {
        let query = supabase.from(item.table).delete();
        if (item.payload.id) {
          query = query.eq('id', item.payload.id);
        } else if (item.payload.list_id && item.payload.game_id) {
          query = query.eq('list_id', item.payload.list_id).eq('game_id', item.payload.game_id);
        }
        const res = await query;
        error = res.error;
      } else if (item.type === 'UPSERT') {
        const res = await supabase.from(item.table).upsert(item.payload);
        error = res.error;
      }

      if (error) {
        console.error(`[SyncQueue] Error procesando acción en ${item.table}:`, error);
        remainingQueue.push(item);
      }
    } catch (e) {
      console.error('[SyncQueue] Excepción al sincronizar:', e);
      remainingQueue.push(item);
    }
  }

  localStorage.setItem(QUEUE_KEY, JSON.stringify(remainingQueue));

  if (remainingQueue.length === 0 && typeof (window as any).showToast === 'function') {
    (window as any).showToast('⚡ Datos sincronizados con la nube correctamente', 'success');
  }
}

// Escuchar el evento de recuperación de red
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    processSyncQueue();
  });
}