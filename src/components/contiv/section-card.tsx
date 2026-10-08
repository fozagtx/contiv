import * as React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from 'cn'

export function SectionCard({
  title,
  description,
  action,
  children,
  className,
}: {
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <Card className={cn('gap-0 p-5 sm:p-6', className)}>
      {(title || action) && (
        <CardHeader className="flex flex-row items-start justify-between gap-4 p-0">
          <div className="flex flex-col gap-1">
            {title && <CardTitle className="text-base">{title}</CardTitle>}
            {description && (
              <CardDescription>{description}</CardDescription>
            )}
          </div>
          {action}
        </CardHeader>
      )}
      <CardContent className={cn('p-0', (title || action) && 'mt-5')}>
        {children}
      </CardContent>
    </Card>
  )
}
