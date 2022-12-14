import * as React from 'react'
import { QueryClient, QueryClientProvider, setLogger } from 'react-query'
import { act, renderHook } from '@testing-library/react-hooks'
import { createUseRapperMutation } from '../src'
import { noopLogger } from './utils'
import { http } from './rapper3'

const useRapperMutation = createUseRapperMutation(http)

describe('useRapperMutation', () => {
  beforeEach(() => {
    setLogger(noopLogger)
  })

  it('should return null at first', () => {
    const queryClient = new QueryClient()
    const wrapper: React.FC<any> = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(() => useRapperMutation('POST/test2'), {
      wrapper,
    })

    expect(result.current.data).toBeFalsy()
    expect(result.current.isLoading).toBe(false)
  })

  it('should become loading when call mutate', async () => {
    const queryClient = new QueryClient()
    const wrapper: React.FC<any> = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result, waitFor } = renderHook(() => useRapperMutation('POST/test2'), {
      wrapper,
    })

    act(() => {
      result.current.mutate({ foo: 'bar' })
    })
    await waitFor(() => {
      expect(result.current.data).toBeFalsy()
      expect(result.current.isLoading).toBe(true)
    })
  })

  it('should get data after fetch', async () => {
    const queryClient = new QueryClient()
    const wrapper: React.FC<any> = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result, waitFor } = renderHook(() => useRapperMutation('POST/test2'), {
      wrapper,
    })

    act(() => {
      result.current.mutate({ foo: 'bar' })
    })

    // jest.advanceTimersByTime(1000)
    await waitFor(() => {
      expect(result.current.data).toEqual({ foo: 'bar' })
      expect(result.current.isLoading).toBe(false)
    })
  })

  it('should return error', async () => {
    const queryClient = new QueryClient()
    const wrapper: React.FC<any> = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result, waitFor } = renderHook(() => useRapperMutation('POST/error'), {
      wrapper,
    })

    act(() => {
      result.current.mutate({ foo: 'bar' })
    })

    // jest.advanceTimersByTime(1000)
    await waitFor(() => {
      expect(result.current.data).toBeFalsy()
      expect(result.current.isLoading).toBe(false)
      expect(result.current.isError).toBe(true)
      expect(result.current.error).toEqual({ foo: 'error' })
    })
  })
})
