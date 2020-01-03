import { assertEquals, assertStrictEq, test } from '../dev-dependencies.js';
import pogo from '../main.js';

const encoder = new TextEncoder();

test('response.code() set status code', async () => {
    const server = pogo.server();
    server.route({
        method : 'GET',
        path   : '/',
        handler(request, h) {
            return h.response('hi').code(418);
        }
    });
    const response = await server.inject({
        method : 'GET',
        url    : '/'
    });
    assertStrictEq(response.status, 418);
    assertStrictEq(response.headers.get('content-type'), 'text/html; charset=utf-8');
    assertEquals(response.body, encoder.encode('hi'));
});

test('response.created() set status and location', async () => {
    const server = pogo.server();
    server.route({
        method : 'GET',
        path   : '/no-location',
        handler(request, h) {
            return h.response('one').created();
        }
    });
    server.route({
        method : 'GET',
        path   : '/with-location',
        handler(request, h) {
            return h.response('two').created('/yay');
        }
    });
    const responseNoLocation = await server.inject({
        method : 'GET',
        url    : '/no-location'
    });
    const responseWithLocation = await server.inject({
        method : 'GET',
        url    : '/with-location'
    });
    assertStrictEq(responseNoLocation.status, 201);
    assertStrictEq(responseNoLocation.headers.get('content-type'), 'text/html; charset=utf-8');
    assertStrictEq(responseNoLocation.headers.has('location'), false);
    assertEquals(responseNoLocation.body, encoder.encode('one'));
    assertStrictEq(responseWithLocation.status, 201);
    assertStrictEq(responseWithLocation.headers.get('content-type'), 'text/html; charset=utf-8');
    assertStrictEq(responseWithLocation.headers.get('location'), '/yay');
    assertEquals(responseWithLocation.body, encoder.encode('two'));
});

test('response.header() set custom header', async () => {
    const server = pogo.server();
    server.route({
        method : 'GET',
        path   : '/',
        handler(request, h) {
            return h.response('hi').header('x-dog', 'woof');
        }
    });
    const response = await server.inject({
        method : 'GET',
        url    : '/'
    });
    assertStrictEq(response.status, 200);
    assertStrictEq(response.headers.get('content-type'), 'text/html; charset=utf-8');
    assertStrictEq(response.headers.get('x-dog'), 'woof');
    assertEquals(response.body, encoder.encode('hi'));
});

test('response.location() set location header', async () => {
    const server = pogo.server();
    server.route({
        method : 'GET',
        path   : '/',
        handler(request, h) {
            return h.response('hi').location('/over-the-rainbow');
        }
    });
    const response = await server.inject({
        method : 'GET',
        url    : '/'
    });
    assertStrictEq(response.status, 200);
    assertStrictEq(response.headers.get('content-type'), 'text/html; charset=utf-8');
    assertStrictEq(response.headers.get('location'), '/over-the-rainbow');
    assertEquals(response.body, encoder.encode('hi'));
});

test('response.type() override default content-type handling', async () => {
    const server = pogo.server();
    server.route({
        method : 'GET',
        path   : '/',
        handler(request, h) {
            return h.response({ hello : 'world' }).type('weird/type');
        }
    });
    const response = await server.inject({
        method : 'GET',
        url    : '/'
    });
    assertStrictEq(response.status, 200);
    assertStrictEq(response.headers.get('content-type'), 'weird/type');
    assertEquals(response.body, encoder.encode(JSON.stringify({ hello : 'world' })));
});
