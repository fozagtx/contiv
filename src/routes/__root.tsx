import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { HeroUIProvider } from '@heroui/react'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Contiv',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'icon',
        href: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%230F8A52'/%3E%3C/svg%3E",
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="glass-light">
      <head>
        <HeadContent />
      </head>
      <body>
        <HeroUIProvider>{children}</HeroUIProvider>
        <Scripts />
      </body>
    </html>
  )
}
