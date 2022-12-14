import * as React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react-hooks'
import { createUseRapperQuery } from '../src'
import { http, IModels } from './rapper3'
import { noopLogger } from './utils'

const useRapperQuery = createUseRapperQuery(http)

describe('useRapperQuery', () => {
  beforeEach(() => {
    // jest.useFakeTimers()
  })

  it('should return null at first', () => {
    const queryClient = new QueryClient({ logger: noopLogger })
    const wrapper: React.FC<any> = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(() => useRapperQuery('GET/test1', { foo: 'bar' }), { wrapper })

    expect(result.current.data).toBeFalsy()
    expect(result.current.isLoading).toBe(true)
    expect(result.current.isFetching).toBe(true)
  })

  it('should return result after fetched', async () => {
    const queryClient = new QueryClient({ logger: noopLogger })
    const wrapper: React.FC<any> = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result, waitFor } = renderHook(() => useRapperQuery('GET/test1', { foo: 'bar' }), {
      wrapper,
    })

    await waitFor(() => {
      expect(result.current.data).toEqual({ foo: 'bar' })
      expect(result.current.isLoading).toBe(false)
      expect(result.current.isFetching).toBe(false)
    })
  })

  it('should be fetching when refetching', async () => {
    const queryClient = new QueryClient({
      logger: noopLogger,
    })
    const wrapper: React.FC<any> = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result, waitFor } = renderHook(
      () => useRapperQuery('GET/test/random', { foo: 'bar' }),
      {
        wrapper,
      },
    )

    await waitFor(() => {
      expect(result.current.isFetched).toBe(true)
    })
    const previous = result.current.data

    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      result.current.refetch()
    })
    await waitFor(() => {
      expect(result.current.data).not.toEqual(previous)
    })
  })

  it('should retry when error', async () => {
    const queryClient = new QueryClient({ logger: noopLogger })
    const wrapper: React.FC<any> = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result, waitFor } = renderHook(() => useRapperQuery('GET/error', { foo: 'bar' }), {
      wrapper,
    })

    // jest.advanceTimersByTime(1000)
    await waitFor(() => {
      expect(result.current.data).toBeFalsy()
      expect(result.current.isLoading).toBe(true)
      expect(result.current.isFetching).toBe(true)
    })
  })

  it('should return error when retry disabled', async () => {
    const queryClient = new QueryClient({ logger: noopLogger })
    const wrapper: React.FC<any> = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result, waitFor } = renderHook(
      () =>
        useRapperQuery(
          'GET/error',
          {},
          {
            retry: false,
          },
        ),
      { wrapper },
    )

    // jest.advanceTimersByTime(1000)
    await waitFor(() => {
      expect(result.current.data).toBeFalsy()
      expect(result.current.isError).toBe(true)
      expect(result.current.error).toEqual({ foo: 'error' })
    })
  })
})
