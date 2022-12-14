import * as React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react-hooks'
import { createUseRapperInfiniteQuery } from '../src'
import { noopLogger } from './utils'
import { http } from './rapper3'

const useRapperInfiniteQuery = createUseRapperInfiniteQuery(http)

describe('useRapperInfiniteQuery', () => {
  beforeEach(() => {
    // jest.useFakeTimers()
  })

  it('should return null at first', () => {
    const queryClient = new QueryClient({ logger: noopLogger })
    const wrapper: React.FC<any> = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(() => useRapperInfiniteQuery('GET/list', { limit: 1 }), {
      wrapper,
    })

    expect(result.current.data).toBeFalsy()
    expect(result.current.isLoading).toBe(true)
    expect(result.current.isFetching).toBe(true)
  })

  it('should return result after fetched', async () => {
    const queryClient = new QueryClient({ logger: noopLogger })
    const wrapper: React.FC<any> = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result, waitFor } = renderHook(() => useRapperInfiniteQuery('GET/list', { limit: 1 }), {
      wrapper,
    })

    await waitFor(() => {
      expect(result.current.data?.pages).toHaveLength(1)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.isFetching).toBe(false)
      expect(result.current.data?.pages[0].data).toEqual([{ id: 1 }])
    })
  })

  it('should load more pages', async () => {
    const queryClient = new QueryClient({ logger: noopLogger })
    const wrapper: React.FC<any> = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result, waitFor } = renderHook(
      () =>
        useRapperInfiniteQuery(
          'GET/list',
          { limit: 1 },
          {
            keepPreviousData: true,
            getNextPageParam(lastPage) {
              return { limit: 1, offset: lastPage.cursor }
            },
          },
        ),
      {
        wrapper,
      },
    )

    // jest.advanceTimersByTime(1000)

    await waitFor(() => {
      expect(result.current.hasNextPage).toBe(true)
    })

    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      result.current.fetchNextPage()
    })
    await waitFor(() => {
      expect(result.current.data?.pages).toHaveLength(2)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.isFetching).toBe(false)
      expect(result.current.data?.pages[0].data).toEqual([{ id: 1 }])
      expect(result.current.data?.pages[1].data).toEqual([{ id: 2 }])
    })
  })
})
