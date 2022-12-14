import { createHttpRequest } from '../src';

const http = createHttpRequest({
  baseURL: 'https://jsonplaceholder.typicode.com/',
});

describe('@rapper3/request: basic', () => {
  describe('Test GET', () => {
    it('GET: no params', async () => {
      const req = http('GET/posts/1' as never);

      expect(req).toBeInstanceOf(Promise);
      const res = await req;
      expect(res).toHaveProperty('id', 1);
    });

    it('GET: has params', async () => {
      const res = await http('GET/posts/:id/comments' as never, { id: 1 } as any);
      expect(res).toHaveProperty('length', 5);
    });
    it('GET: has params get()', async () => {
      const res = await http.get('GET/posts/:id/comments' as never, { id: 1 } as any);
      expect(res).toHaveProperty('length', 5);
    });

    it('GET: has query', async () => {
      const res = await http('GET/comments' as never, { postId: 1 } as any);
      expect(res[0]).toHaveProperty('postId', 1);
    });
    it('GET: has query get()', async () => {
      const res = await http.get('GET/comments' as never, { postId: 1 } as any);
      expect(res[0]).toHaveProperty('postId', 1);
    });
  });

  describe('Test POST', () => {
    it('POST: has query', async () => {
      const res = await http(
        'POST/posts' as never,
        {
          title: 'foo',
          body: 'bar',
          userId: 1,
        } as any,
      );
      expect(res).toHaveProperty('title', 'foo');
    });

    it('POST: has payload post()', async () => {
      const res = await http.post(
        'POST/posts' as never,
        {
          title: 'foo',
          body: 'bar',
          userId: 1,
        } as any,
      );
      expect(res).toHaveProperty('title', 'foo');
    });
  });

  describe('Test PUT', () => {
    it('PUT: has payload', async () => {
      const res = await http(
        'PUT/posts/1' as never,
        {
          id: 1,
          title: 'foo',
          body: 'bar',
          userId: 1,
        } as any,
      );
      expect(res).toHaveProperty('title', 'foo');
    });
    it('PUT: has payload put()', async () => {
      const res = await http.put(
        'PUT/posts/1' as never,
        {
          id: 1,
          title: 'foo',
          body: 'bar',
          userId: 1,
        } as any,
      );
      expect(res).toHaveProperty('title', 'foo');
    });
  });

  describe('Test Patch', () => {
    it('PATCH: has payload', async () => {
      const res = await http(
        'PATCH/posts/1' as never,
        {
          title: 'foo',
        } as any,
      );
      expect(res).toHaveProperty('title', 'foo');
    });
    it('PATCH: has payload patch()', async () => {
      const res = await http.patch(
        'PATCH/posts/1' as never,
        {
          title: 'foo',
        } as any,
      );
      expect(res).toHaveProperty('title', 'foo');
    });
  });
});
