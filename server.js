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

const tickets = [
  {
    id: 1,
    name: 'Поменять краску в принтере',
    description: 'Кабинет 400, картридж на складе',
    status: 'false',
    created: new Date(),
  },
  {
    id: 2,
    name: 'Переустановить Windows',
    description: 'ПК в кабинете 200',
    status: 'false',
    created: new Date(),
  },
  {
    id: 4,
    name: 'Встретить курьера',
    description: '12:00 у главного входа',
    status: 'false',
    created: new Date(),
  }
];

app.use(async ctx => {
  const { method, id } = ctx.request.query;

  switch (method) {
    case 'allTickets':
      ctx.response.body = tickets;
      return;
    case 'ticketById':
      const requiredTicket = tickets.find(o => o.id === parseInt(id));
      ctx.response.body = requiredTicket;
      return;
    case 'createTicket':
      const data = ctx.request.body;

      if (data.id) {
        const ticketToEdit = tickets.find(o => o.id === parseInt(id));
        ticketToEdit.name = data.name;
        ticketToEdit.description = data.description;
        ticketToEdit.status = data.status;
      } else {
        const num = uuid.v4();
        const newTicket = {
          id: parseInt(num, 16),
          name: data.name,
          description: data.description,
          status: 'false',
          created: new Date(),
        };
  
        tickets.push(newTicket);
      }

      ctx.response.body = tickets;
      return;
    case 'deleteTicket':
      const index = tickets.findIndex(o => o.id === parseInt(id));
      tickets.splice(index,1);
      ctx.response.body = tickets;
      return;  
    default:
        ctx.response.status = 404;
        return;
  }
});

// app.use(async ctx => {
//   console.log(ctx.request.query);
//   ctx.response.body = 'server response';
// });

const port = process.env.PORT || 7070;
http.createServer(app.callback()).listen(port);
