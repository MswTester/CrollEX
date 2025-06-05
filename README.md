# CrollEX HTTP Client

An HTTP client built with [Remix](https://remix.run/), styled using
[Tailwind CSS](https://tailwindcss.com/) and
[shadcn/ui](https://ui.shadcn.com/).

The application lets you craft requests, inspect responses and analyze HTML in a
simple interface.

## Quick Start

Install dependencies and start the development server:

```sh
npm install
npm run dev
```

The project requires **Node.js 20** or later.

## Environment

All outgoing requests are made through the Remix actions at
`/api/request` and `/api/analyze`. These endpoints proxy the target URL on the
server, allowing you to fetch resources without browser CORS restrictions.
Ensure the server can reach the desired hosts when deploying.

## Deployment

First, build your app for production:

```sh
npm run build
```

Then run the app in production mode:

```sh
npm start
```

Now you'll need to pick a host to deploy it to.

### DIY

If you're familiar with deploying Node applications, the built-in Remix app server is production-ready.

Make sure to deploy the output of `npm run build`

- `build/server`
- `build/client`

## Styling

All components are built with [shadcn/ui](https://ui.shadcn.com/) and styled
with Tailwind CSS. If you want to customize the look and feel, edit the Tailwind
config or extend the shadcn components as needed.
