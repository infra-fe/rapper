import { createHttpRequest } from '@rapper3/request';
import { IModels } from './models';

function delay<T>(value: T, time = 16) {
  return new Promise<T>((resolve) =>
    setTimeout(() => {
      resolve(value);
    }, time),
  );
}

export const fetch = {
  'GET/test1': (req?: { foo?: string }) => delay({ foo: req?.foo }, 32),
  'GET/test2': (req?: { foo?: string }) => delay({ foo: req?.foo }, 32),
  'GET/test/random': (_req?: { foo?: string }) => delay({ foo: Math.random() }, 400),
  'GET/error': (_: {}) => delay(null).then(() => Promise.reject({ foo: 'error' })),
  'POST/test2': (req?: { foo?: string }) => delay({ foo: req?.foo }, 32),
  'POST/error': (_: { foo?: string }) => delay(null).then(() => Promise.reject({ foo: 'error' })),
  'GET/list': (req?: { limit?: number; offset?: number }) => {
    const limit = req?.limit ?? 10;
    const offset = req?.offset ?? 0;
    return delay({
      data: new Array(limit).fill(0).map((_, index) => ({ id: offset + index + 1 })),
      cursor: offset + limit,
    });
  },
};

export type RequestInstance = ReturnType<typeof createHttpRequest<IModels>>;

export const http: RequestInstance = ((url: keyof typeof fetch, payload: any) => {
  return fetch[url](payload);
}) as any;

export default http;
