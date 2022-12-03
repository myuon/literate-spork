import { useCallback, useEffect, useRef, useState } from "react";

export const useTaskQueue = (options_: { semaphoreSize: number }) => {
  const [finished, setFinished] = useState<Record<string, boolean>>({});
  const [taskQueue, setTaskQueue] = useState<{
    queue: string[];
    semaphore: number;
  }>({
    queue: [],
    semaphore: 0,
  });
  const isRunning = taskQueue.queue.length > 0 || taskQueue.semaphore > 0;
  const promise = useRef<(id: string) => Promise<void>>();
  const options = useRef(options_);

  const runQueue = useCallback(async () => {
    if (taskQueue.queue.length === 0) {
      return;
    }
    if (taskQueue.semaphore >= options.current.semaphoreSize) {
      return;
    }

    const [task, ...rest] = taskQueue.queue;
    setTaskQueue((prev) => {
      return {
        queue: rest,
        semaphore: prev.semaphore + 1,
      };
    });
    setFinished((prev) => {
      const current = { ...prev };
      current[task] = false;
      return current;
    });

    await promise.current?.(task);

    setFinished((prev) => {
      const current = { ...prev };
      current[task] = true;
      return current;
    });
    setTaskQueue((prev) => {
      return {
        queue: prev.queue,
        semaphore: prev.semaphore - 1,
      };
    });
  }, [taskQueue]);

  useEffect(() => {
    if (isRunning) {
      runQueue();
    }
  }, [isRunning, runQueue]);

  return {
    start: (taskIds: string[], do_: (id: string) => Promise<void>) => {
      setFinished(Object.fromEntries(taskIds.map((t) => [t, false])));
      setTaskQueue({
        queue: taskIds,
        semaphore: 0,
      });
      promise.current = do_;
    },
    finished,
    isRunning,
    clearTaskQueue: () => {
      setTaskQueue({
        queue: [],
        semaphore: 0,
      });
    },
  };
};
