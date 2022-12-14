import type { createHttpRequest } from '@rapper3/request';

export type AxiosConfig<T> = NonNullable<Parameters<typeof createHttpRequest<any, T>>[0]>;

export type BaseRequest = (url: string, params?: any, config?: any) => any;

export type BaseModels<T extends string = string> = Record<
  T,
  {
    Req: unknown;
    Res: unknown;
  }
>;

export type RequestInstance<
  IModels extends Record<
    Exclude<keyof IModels, number | symbol>,
    {
      Req: unknown;
      Res: unknown;
    }
  >,
  D = any,
> = ReturnType<typeof createHttpRequest<IModels, D>>;

export type BaseFetchType = Record<string, (...args: any[]) => any>;
export type Await<T> = T extends Promise<infer U> ? U : T;
