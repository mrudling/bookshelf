import {renderHook, act} from '@testing-library/react-hooks'
import {useAsync} from '../hooks'

function deferred() {
  let resolve, reject
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })
  return {promise, resolve, reject}
}

const mock = {
  data: null,
  error: null,
  isError: false,
  isIdle: true,
  isLoading: false,
  isSuccess: false,
  reset: expect.any(Function),
  run: expect.any(Function),
  setData: expect.any(Function),
  setError: expect.any(Function),
  status: 'idle',
}

test('calling run with a promise which resolves', async () => {
  const {promise, resolve} = deferred()
  const {result} = renderHook(() => useAsync())
  resolve()
  await promise
  expect(result.current).toEqual(mock)
  act(() => result.current.run(promise))
  expect(result.current).toEqual({
    ...mock,
    isIdle: false,
    isLoading: true,
    status: 'pending',
  })
  resolve()
  await promise
  expect(result.current).toEqual({
    ...mock,
    data: undefined,
    isIdle: false,
    isSuccess: true,
    status: 'resolved',
  })
  act(() => result.current.reset())
  expect(result.current).toEqual({
    ...mock,
    status: 'idle',
  })
})

test('calling run with a promise which rejects', async () => {
  const {promise, reject} = deferred()
  const {result} = renderHook(() => useAsync())
  reject()
  expect(result.current).toEqual(mock)
  await act(() => result.current.run(promise).catch(() => {}))
  expect(result.current).toEqual({
    ...mock,
    error: undefined,
    isError: true,
    isIdle: false,
    status: 'rejected',
  })
})

test('can specify an initial state', async () => {
  const defaultValue = 'custom'
  const {promise, resolve} = deferred()
  const customInitialState = {status: defaultValue}
  const {result} = renderHook(() => useAsync(customInitialState))
  resolve()
  await promise
  expect(result.current).toEqual({
    ...mock,
    isIdle: false,
    status: defaultValue,
  })
})

test('can set the data', async () => {
  const data = 'some data'
  const {promise, resolve} = deferred()
  const {result} = renderHook(() => useAsync())
  resolve()
  await promise
  act(() => result.current.setData(data))
  expect(result.current).toEqual({
    ...mock,
    data,
    isIdle: false,
    isSuccess: true,
    status: 'resolved',
  })
})

test('can set the error', async () => {
  const error = new Error('whoops')
  const {promise, resolve} = deferred()
  const {result} = renderHook(() => useAsync())
  resolve()
  await promise
  act(() => result.current.setError(error))
  expect(result.current).toEqual({
    ...mock,
    error,
    isError: true,
    isIdle: false,
    status: 'rejected',
  })
})

test.only('No state updates happen if the component is unmounted while pending', async () => {
  console.error = jest.fn()
  const {promise, resolve} = deferred()
  const {result, unmount} = renderHook()
  resolve()
  await promise
  act(() => result.current.run(promise))
  unmount()
  expect(console.error).not.toHaveBeenCalled()
})
// 🐨 ensure that console.error is not called (React will call console.error if updates happen when unmounted)

test('calling "run" without a promise results in an early error', async () => {
  const {reject} = deferred()
  const {result} = renderHook(() => useAsync())
  // reject()
  await act(() => result.current.run())
  expect(result.current).toEqual({
    ...mock,
    error: undefined,
    isError: true,
    isIdle: false,
    status: 'rejected',
  })
})
