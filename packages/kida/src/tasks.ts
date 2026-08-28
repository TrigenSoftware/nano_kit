import {
  type AnySignal,
  type AnyReadableSignal,
  type ReadableNode,
  isFunction
} from 'agera'

export type Task<T = void> = Promise<T> | (() => Promise<T>)

export type TaskTarget = AnySignal | AnySignal[]

interface TasksNode extends ReadableNode {
  tsk?: Set<Promise<unknown>>
}

/**
 * Attach a task to the signal it fills. Until the task settles it is
 * awaited by `waitTasks` of any signal that depends on the target.
 * @param $to - The signal or signals the task fills.
 * @param task - The task promise or function that returns a promise.
 * @returns The task promise.
 */
export function task<T = void>(
  $to: TaskTarget,
  task: Task<T>
): Promise<T> {
  const promise = isFunction(task) ? task() : task

  for (const $signal of isFunction($to) ? [$to] : $to) {
    const pool = ($signal.node as TasksNode).tsk ??= new Set()
    const done = (): boolean => pool.delete(taskDone)
    // The pool holds the derived promise: its `then` is registered here,
    // before `waitTasks` registers its own, so the pool is already clean
    // when the wait wakes up. It never rejects - `pool.delete` cannot
    // throw - which is what makes `Promise.all` in `waitTasks` safe
    const taskDone = promise.then(done, done)

    pool.add(taskDone)
  }

  return promise
}

/**
 * Wait for the tasks of the signal and of every signal it depends on,
 * until none are left. The dependency graph is re-collected after every
 * wave, so a task spawned by a task and a dependency linked by a settled
 * value are awaited too.
 * @param $of - The signal to wait for.
 * @returns Promise that resolves when no tasks are left.
 */
/* @__NO_SIDE_EFFECTS__ */
export async function waitTasks($of: AnyReadableSignal): Promise<void> {
  const tasks: Promise<unknown>[] = []
  // Tasks of a signal are derived, never stored: a node holds only the
  // tasks attached to it, and the full set is collected by walking the
  // dependency graph on demand. The set doubles as the queue: nodes
  // added while it is iterated are visited too, and `add` dedupes, so
  // no separate visited set is needed
  const nodes = new Set([$of.node as TasksNode])

  for (const node of nodes) {
    if (node.tsk) {
      tasks.push(...node.tsk)
    }

    for (let link = node.deps; link; link = link.nextDep) {
      nodes.add(link.dep as TasksNode)
    }
  }

  if (tasks.length) {
    await Promise.all(tasks)
    await waitTasks($of)
  }
}
