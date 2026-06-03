import {
  isFunction,
  inject
} from 'kida'

export type TasksPool = Set<Promise<unknown>>

export type Task<T = void> = Promise<T> | (() => Promise<T>)

export type TasksRunner = <T>(fn: Task<T>) => Promise<T>

/**
 * Wait for all currently running tasks to finish.
 * @param tasksPool - Tasks pool storage.
 * @returns Promise that resolves when all currently running tasks are finished.
 */
/* @__NO_SIDE_EFFECTS__ */
export function waitCurrentTasks(tasksPool: TasksPool) {
  return Promise.allSettled(tasksPool)
}

/**
 * Wait for all tasks to finish.
 * @param tasksPool - Tasks pool storage.
 * @returns Promise that resolves when all tasks are finished.
 */
/* @__NO_SIDE_EFFECTS__ */
export async function waitTasks(tasksPool: TasksPool) {
  while (tasksPool.size) {
    await waitCurrentTasks(tasksPool)
  }
}

export function taskPromise<T>(task: Task<T>): Promise<T> {
  return isFunction(task) ? task() : task
}

/**
 * Add a task to the tasks pool.
 * @param tasksPool - Tasks pool storage.
 * @param task - The task promise or function that returns a promise.
 * @returns The task promise.
 */
export function addTask<T = void>(
  tasksPool: TasksPool,
  task: Task<T>
) {
  const promise = taskPromise(task)
  const done = (): boolean => tasksPool.delete(taskDone)
  const taskDone = promise.then(done, done)

  tasksPool.add(taskDone)

  return promise
}

/**
 * Create a tasks runner.
 * @param tasksPool - Tasks pool storage.
 * @returns The function to run task within the pool.
 */
/* @__NO_SIDE_EFFECTS__ */
export function tasksRunner(
  tasksPool: TasksPool = new Set()
): TasksRunner {
  return fn => addTask(tasksPool, fn)
}

/**
 * Injectable factory for tasks pool.
 * @returns The tasks pool.
 */
export function TasksPool$(): TasksPool {
  return new Set<Promise<unknown>>()
}

/**
 * Injectable factory for tasks runner.
 * @returns The function to run task within the pool.
 */
export function TasksRunner$() {
  const tasksPool = inject(TasksPool$)

  return tasksRunner(tasksPool)
}
