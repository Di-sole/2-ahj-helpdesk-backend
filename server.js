const http = require('http');
const path = require('path');
const fs = require('fs');
const Koa = require('koa');
const koaBody = require('koa-body');
const koaStatic = require('koa-static');
const uuid = require('uuid');
const app = new Koa();

const public = path.join(__dirname, '/public')
app.use(koaStatic(public));

app.use(koaBody({
    text: true,
    urlencoded: true,
    multipart: true,
    json: true,
  }));

// => CORS
app.use(async (ctx, next) => {
  const origin = ctx.request.get('Origin');
  if (!origin) {
    return await next();
  }

  const headers = { 'Access-Control-Allow-Origin': '*', };

  if (ctx.request.method !== 'OPTIONS') {
    ctx.response.set({...headers});
    try {
      return await next();
    } catch (e) {
      e.headers = {...e.headers, ...headers};
      throw e;
    }
  }

  if (ctx.request.get('Access-Control-Request-Method')) {
    ctx.response.set({
      ...headers,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH',
    });

    if (ctx.request.get('Access-Control-Request-Headers')) {
      ctx.response.set('Access-Control-Allow-Headers', ctx.request.get('Access-Control-Request-Headers'));
    }

    ctx.response.status = 204;
  }
});

// => GET/POST

const tickets = [];

app.use(async ctx => {
    const { method } = ctx.request.query;
    console.log(method);

    switch (method) {
        case 'allTickets':
            console.log(ctx.request.query);
            return;
        case 'ticketById':
            console.log(ctx.request.query);
            return;
        case 'createTicket':
            console.log(ctx.request.body);
            return;
        default:
            ctx.response.status = 404;
            return;
    }
});

const port = process.env.PORT || 7070;
http.createServer(app.callback()).listen(port);
