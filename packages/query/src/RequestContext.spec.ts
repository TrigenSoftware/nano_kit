import {
  vi,
  describe,
  it,
  expect
} from 'vitest'
import {
  queryKey,
  dataCacheFacade
} from './cache.js'
import { CacheStorage } from './CacheStorage.js'
import { ClientContext } from './ClientContext.js'
import {
  RequestContext,
  QueryContext,
  onSuccess,
  onError,
  onSettled,
  stopErrorPropagation,
  previous
} from './RequestContext.js'

describe('query', () => {
  describe('RequestContext', () => {
    describe('settled', () => {
      it('should call onSuccess on success', () => {
        const ctx = new RequestContext()
        const successFn = vi.fn()

        onSuccess(ctx, successFn)
        ctx.settled('result', undefined)

        expect(successFn).toHaveBeenCalledTimes(1)
        expect(successFn).toHaveBeenCalledWith('result')
      })

      it('should call onError on error', () => {
        const ctx = new RequestContext()
        const errorFn = vi.fn()

        onError(ctx, errorFn)
        ctx.settled(undefined, 'test error')

        expect(errorFn).toHaveBeenCalledTimes(1)
        expect(errorFn).toHaveBeenCalledWith('test error')
      })

      it('should call onSettled on success', () => {
        const ctx = new RequestContext()
        const settledFn = vi.fn()

        onSettled(ctx, settledFn)
        ctx.settled('result', undefined)

        expect(settledFn).toHaveBeenCalledTimes(1)
        expect(settledFn).toHaveBeenCalledWith('result', undefined)
      })

      it('should call onSettled on error', () => {
        const ctx = new RequestContext()
        const settledFn = vi.fn()

        onSettled(ctx, settledFn)
        ctx.settled(undefined, 'test error')

        expect(settledFn).toHaveBeenCalledTimes(1)
        expect(settledFn).toHaveBeenCalledWith(undefined, 'test error')
      })

      it('should not call onSuccess on error', () => {
        const ctx = new RequestContext()
        const successFn = vi.fn()

        onSuccess(ctx, successFn)
        ctx.settled(undefined, 'test error')

        expect(successFn).not.toHaveBeenCalled()
      })

      it('should not call onError on success', () => {
        const ctx = new RequestContext()
        const errorFn = vi.fn()

        onError(ctx, errorFn)
        ctx.settled('result', undefined)

        expect(errorFn).not.toHaveBeenCalled()
      })

      it('should call all callbacks on success', () => {
        const ctx = new RequestContext()
        const successFn = vi.fn()
        const settledFn = vi.fn()

        onSuccess(ctx, successFn)
        onSettled(ctx, settledFn)
        ctx.settled('result', undefined)

        expect(settledFn).toHaveBeenCalledTimes(1)
        expect(successFn).toHaveBeenCalledTimes(1)
      })

      it('should call all callbacks on error', () => {
        const ctx = new RequestContext()
        const errorFn = vi.fn()
        const settledFn = vi.fn()

        onError(ctx, errorFn)
        onSettled(ctx, settledFn)
        ctx.settled(undefined, 'test error')

        expect(settledFn).toHaveBeenCalledTimes(1)
        expect(errorFn).toHaveBeenCalledTimes(1)
      })
    })

    describe('onSuccess', () => {
      it('should stack multiple callbacks', () => {
        const ctx = new RequestContext()
        const fn1 = vi.fn()
        const fn2 = vi.fn()
        const fn3 = vi.fn()

        onSuccess(ctx, fn1)
        onSuccess(ctx, fn2)
        onSuccess(ctx, fn3)
        ctx.settled('result', undefined)

        expect(fn1).toHaveBeenCalledTimes(1)
        expect(fn1).toHaveBeenCalledWith('result')
        expect(fn2).toHaveBeenCalledTimes(1)
        expect(fn2).toHaveBeenCalledWith('result')
        expect(fn3).toHaveBeenCalledTimes(1)
        expect(fn3).toHaveBeenCalledWith('result')
      })
    })

    describe('onError', () => {
      it('should stack multiple callbacks', () => {
        const ctx = new RequestContext()
        const fn1 = vi.fn()
        const fn2 = vi.fn()
        const fn3 = vi.fn()
        const error = 'test error'

        onError(ctx, fn1)
        onError(ctx, fn2)
        onError(ctx, fn3)
        ctx.settled(undefined, error)

        expect(fn1).toHaveBeenCalledTimes(1)
        expect(fn1).toHaveBeenCalledWith(error)
        expect(fn2).toHaveBeenCalledTimes(1)
        expect(fn2).toHaveBeenCalledWith(error)
        expect(fn3).toHaveBeenCalledTimes(1)
        expect(fn3).toHaveBeenCalledWith(error)
      })
    })

    describe('onSettled', () => {
      it('should stack multiple callbacks', () => {
        const ctx = new RequestContext()
        const fn1 = vi.fn()
        const fn2 = vi.fn()
        const fn3 = vi.fn()

        onSettled(ctx, fn1)
        onSettled(ctx, fn2)
        onSettled(ctx, fn3)
        ctx.settled('result', undefined)

        expect(fn1).toHaveBeenCalledTimes(1)
        expect(fn1).toHaveBeenCalledWith('result', undefined)
        expect(fn2).toHaveBeenCalledTimes(1)
        expect(fn2).toHaveBeenCalledWith('result', undefined)
        expect(fn3).toHaveBeenCalledTimes(1)
        expect(fn3).toHaveBeenCalledWith('result', undefined)
      })
    })

    describe('stopErrorPropagation', () => {
      it('should set stopErrorPropagation to true', () => {
        const ctx = new RequestContext()

        expect(ctx.stopErrorPropagation).toBe(false)

        stopErrorPropagation(ctx)

        expect(ctx.stopErrorPropagation).toBe(true)
      })
    })

    describe('previous', () => {
      it('should return undefined without a previous request', () => {
        expect(previous(new RequestContext())).toBeUndefined()
      })

      it('should return the promise of the previous request', () => {
        const clientCtx = new ClientContext<string>()
        const prevCtx = new RequestContext<string>()
        const promise = clientCtx.run(prevCtx, () => Promise.resolve('result'), () => {})

        expect(previous(new RequestContext(prevCtx))).toBe(promise)
      })

      it('should resolve with the result of the previous request', async () => {
        const clientCtx = new ClientContext<string>()
        const prevCtx = new RequestContext<string>()

        void clientCtx.run(prevCtx, () => Promise.resolve('result'), () => {})

        expect(await previous(new RequestContext(prevCtx))).toEqual(['result', undefined])
      })

      it('should resolve with the error of the failed previous request', async () => {
        const clientCtx = new ClientContext<string>()
        const prevCtx = new RequestContext<string>()
        const error = new Error('test error')

        void clientCtx.run(prevCtx, () => Promise.reject(error), () => {})

        expect(await previous(new RequestContext(prevCtx))).toEqual([undefined, error])
      })

      it('should keep the previous request when the next one starts', () => {
        const clientCtx = new ClientContext<string>()
        const firstCtx = new RequestContext<string>()
        const firstPromise = clientCtx.run(firstCtx, () => Promise.resolve('first'), () => {})
        const secondCtx = new RequestContext(firstCtx)
        const secondPromise = clientCtx.run(secondCtx, () => Promise.resolve('second'), () => {})
        const thirdCtx = new RequestContext(secondCtx)

        expect(previous(secondCtx)).toBe(firstPromise)
        expect(previous(thirdCtx)).toBe(secondPromise)
      })

      it('should drop the previous request once the request settles', async () => {
        const clientCtx = new ClientContext<string>()
        const prevCtx = new RequestContext<string>()

        void clientCtx.run(prevCtx, () => Promise.resolve('first'), () => {})

        const ctx = new RequestContext(prevCtx)

        await clientCtx.run(ctx, () => Promise.resolve('second'), () => {})

        expect(previous(ctx)).toBeUndefined()
      })
    })

    describe('QueryContext', () => {
      it('should be usable as key with dataCacheFacade', () => {
        const $cache = dataCacheFacade(new CacheStorage())
        const key = queryKey<[string], string>('test')('a')
        const ctx = new QueryContext(key)

        $cache(ctx, 'value')

        expect($cache(ctx)).toBe('value')
        expect($cache(key)).toBe('value')
      })
    })
  })
})
