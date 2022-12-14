import {
  createUseRapperQueries,
  GetResultsFromOption,
  QueriesResults,
} from '../src/useRapperQueries'
import { UseQueryResult } from 'react-query'
import {
  Expect,
  Equal,
  NotAny,
  NotEqual,
  ExpectExtends,
  ExpectFalse,
} from '@type-challenges/utils'
import { http, IModels } from './rapper3'

it.skip('testType', () => {
  const useRapperQueries = createUseRapperQueries(http)

  const result1 = useRapperQueries({
    queries: [],
  })
  type Case1 = Expect<NotAny<typeof result1[0]['data']>>
  type Case12 = Expect<NotEqual<typeof result1[0]['data'], unknown>>

  const result2 = useRapperQueries({
    queries: [{ url: 'GET/test1' }],
  })

  type Case2 = Expect<
    Equal<typeof result2[0]['data'], { foo?: string | undefined } | undefined>
  >
  type Case22 = Expect<Equal<typeof result2['length'], number>>

  const array = [1, 2, 3]
  const result3 = useRapperQueries({
    queries: array.map(() => ({ url: 'GET/test1' } as const)),
  })
  type Case3 = Expect<
    Equal<typeof result3[0]['data'], { foo?: string | undefined } | undefined>
  >

  const result4 = useRapperQueries({
    queries: [{ url: 'GET/test1' }] as const,
  })
  type Case4 = Expect<
    Equal<typeof result4[0]['data'], { foo?: string | undefined } | undefined>
  >
  type Case42 = Expect<Equal<typeof result4['length'], 1>>

  const options = [{ url: 'GET/test1' }] as const
  type Options = typeof options
  type Results = QueriesResults<Options, IModels, [], []>
  type Cases = [
    Results,
    ExpectFalse<ExpectExtends<[] | readonly [], Options>>,
    Expect<ExpectExtends<[any] | readonly [any], Options>>,
    Expect<
      Equal<
        GetResultsFromOption<Options[0], IModels>,
        UseQueryResult<{ foo?: string | undefined }>
      >
    >,
  ]

  const result: any = null
  const _ = result as [Case1, Case12, Case2, Case22, Case3, Case4, Case42, Cases]
})
