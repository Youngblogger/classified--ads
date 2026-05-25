type UploadTask<T = unknown> = {
  id: string;
  file: File;
  execute: (file: File, onProgress: (pct: number) => void) => Promise<T>;
  onProgress: (pct: number) => void;
  onComplete: (result: T) => void;
  onError: (error: Error) => void;
  retriesLeft: number;
  maxRetries: number;
};

type QueueEvent =
  | { type: 'started'; id: string }
  | { type: 'progress'; id: string; pct: number }
  | { type: 'completed'; id: string }
  | { type: 'failed'; id: string; error: Error }
  | { type: 'drained' };

type Listener = (event: QueueEvent) => void;

export function createUploadQueue(maxConcurrency = 3) {
  const queue: UploadTask<any>[] = [];
  let activeCount = 0;
  let aborted = false;
  const listeners = new Set<Listener>();

  function notify(event: QueueEvent) {
    listeners.forEach(l => l(event));
  }

  function on(fn: Listener) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  function enqueue<T>(task: {
    id: string;
    file: File;
    execute: (file: File, onProgress: (pct: number) => void) => Promise<T>;
    onProgress: (pct: number) => void;
    onComplete: (result: T) => void;
    onError: (error: Error) => void;
    maxRetries?: number;
  }): void {
    const entry: UploadTask<T> = {
      ...task,
      retriesLeft: task.maxRetries ?? 3,
      maxRetries: task.maxRetries ?? 3,
    };
    queue.push(entry);
    processNext();
  }

  async function processNext() {
    if (aborted) return;
    if (activeCount >= maxConcurrency || queue.length === 0) {
      if (activeCount === 0 && queue.length === 0) {
        notify({ type: 'drained' });
      }
      return;
    }

    const task = queue.shift()!;
    activeCount++;
    notify({ type: 'started', id: task.id });

    try {
      const result = await task.execute(task.file, (pct: number) => {
        notify({ type: 'progress', id: task.id, pct });
        task.onProgress(pct);
      });
      notify({ type: 'completed', id: task.id });
      task.onComplete(result);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      if (task.retriesLeft > 0) {
        task.retriesLeft--;
        queue.unshift(task);
        notify({ type: 'failed', id: task.id, error: err });
      } else {
        notify({ type: 'failed', id: task.id, error: err });
        task.onError(err);
      }
    } finally {
      activeCount--;
      processNext();
    }
  }

  function abort() {
    aborted = true;
    queue.length = 0;
    activeCount = 0;
  }

  function size() {
    return queue.length + activeCount;
  }

  return { enqueue, abort, on, size };
}
