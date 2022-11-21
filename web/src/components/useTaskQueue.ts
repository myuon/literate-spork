import { useCallback, useEffect, useRef, useState } from "react";

export const useTaskQueue = (options_: { semaphoreSize: number }) => {
  const [finished, setFinished] = useState<boolean[]>([]);
  const [taskQueue, setTaskQueue] = useState<{
    queue: number[];
    semaphore: number;
  }>({
    queue: [],
    semaphore: 0,
  });
  const isRunning = taskQueue.queue.length > 0;
  const promise = useRef<(index: number) => Promise<void>>();
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
      const current = [...prev];
      current[task] = false;
      return current;
    });

    await promise.current?.(task);

    setFinished((prev) => {
      const current = [...prev];
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
    start: (tasks: boolean[], do_: (index: number) => Promise<void>) => {
      setFinished(tasks);
      setTaskQueue({
        queue: tasks.map((_, i) => i),
        semaphore: 0,
      });
      promise.current = do_;
    },
    finished,
    isRunning,
  };
};
