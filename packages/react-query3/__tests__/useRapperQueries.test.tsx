import * as React from 'react'
import { QueryClient, QueryClientProvider, setLogger } from 'react-query'
import { act, renderHook } from '@testing-library/react-hooks'
import { createUseRapperQueries } from '../src'
import { noopLogger } from './utils'
import './useRapperQueries-type.test'
import { http } from './rapper3'

const useRapperQueries = createUseRapperQueries(http)

describe('useRapperQueries', () => {
  beforeEach(() => {
    setLogger(noopLogger)
  })

  it('should return null at first', () => {
    const queryClient = new QueryClient()
    const wrapper: React.FC<any> = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(
      () =>
        useRapperQueries({
          queries: [
            {
              url: 'GET/test1',
              params: {
                foo: 'bar',
              },
            },
          ],
        }),
      {
        wrapper,
      },
    )

    expect(result.current[0].data).toBeFalsy()
    expect(result.current[0].isLoading).toBe(true)
    expect(result.current[0].isFetching).toBe(true)
  })

  it('should return result after fetched', async () => {
    const queryClient = new QueryClient()
    const wrapper: React.FC<any> = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result, waitFor } = renderHook(
      () =>
        useRapperQueries({
          queries: [
            {
              url: 'GET/test1',
              params: { foo: 'bar' },
            },
          ],
        }),
      {
        wrapper,
      },
    )

    // jest.advanceTimersByTime(1000)
    await waitFor(() => {
      expect(result.current[0].data).toEqual({ foo: 'bar' })
      expect(result.current[0].isLoading).toBe(false)
      expect(result.current[0].isFetching).toBe(false)
    })
  })

  it('should be fetching when refetching', async () => {
    const queryClient = new QueryClient()
    const wrapper: React.FC<any> = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result, waitFor } = renderHook(
      () =>
        useRapperQueries({
          queries: [
            {
              url: 'GET/test2',
              params: { foo: 'bar' },
            },
          ],
        }),
      { wrapper },
    )

    // jest.advanceTimersByTime(1000)
    await waitFor(() => {
      expect(result.current[0].isFetched).toBe(true)
    })

    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      result.current[0].refetch()
    })
    await waitFor(
      () => {
        expect(result.current[0].data).toEqual({ foo: 'bar' })
        expect(result.current[0].isLoading).toBe(false)
        expect(result.current[0].isFetching).toBe(true)
      },
      { timeout: 5000, interval: 100 },
    )
  })

  it('should retry when error', async () => {
    const queryClient = new QueryClient()
    const wrapper: React.FC<any> = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result, waitFor } = renderHook(
      () =>
        useRapperQueries({
          queries: [
            {
              url: 'GET/error',
              params: { foo: 'bar' },
            },
          ],
        }),
      { wrapper },
    )

    // jest.advanceTimersByTime(1000)
    await waitFor(() => {
      expect(result.current[0].data).toBeFalsy()
      expect(result.current[0].isLoading).toBe(true)
      expect(result.current[0].isFetching).toBe(true)
    })
  })

  it('should return error when retry disabled', async () => {
    const queryClient = new QueryClient()
    const wrapper: React.FC<any> = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result, waitFor } = renderHook(
      () =>
        useRapperQueries({
          queries: [{ url: 'GET/error', options: { retry: false } }],
        }),
      { wrapper },
    )

    // jest.advanceTimersByTime(1000)
    await waitFor(() => {
      expect(result.current[0].data).toBeFalsy()
      expect(result.current[0].isError).toBe(true)
      expect(result.current[0].error).toEqual({ foo: 'error' })
    })
  })

  it('should return multiple results', async () => {
    const queryClient = new QueryClient()
    const wrapper: React.FC<any> = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result, waitFor } = renderHook(
      () =>
        useRapperQueries({
          queries: [
            { url: 'GET/test1', params: { foo: 'bar' } },
            { url: 'GET/test1', params: { foo: 'bar2' } },
          ],
        }),
      { wrapper },
    )

    // jest.advanceTimersByTime(1000)
    await waitFor(() => {
      expect(result.current[0].data).toEqual({ foo: 'bar' })
      expect(result.current[0].isLoading).toBe(false)
      expect(result.current[0].isFetching).toBe(false)
      expect(result.current[1].data).toEqual({ foo: 'bar2' })
      expect(result.current[1].isLoading).toBe(false)
      expect(result.current[1].isFetching).toBe(false)
    })
  })
})
