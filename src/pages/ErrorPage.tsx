import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom'
import { buttonVariants } from '@/components/atoms/Button'

export const ErrorPage = () => {
  const error = useRouteError()

  let title = 'Something went wrong'
  let detail = 'An unexpected error occurred while rendering this view.'

  if (isRouteErrorResponse(error)) {
    title = `${error.status} — ${error.statusText}`
    detail = error.data || detail
  } else if (error instanceof Error) {
    detail = error.message
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-poor/30 bg-poor-soft text-2xl text-poor">
        !
      </div>
      <div>
        <h1 className="text-xl font-semibold text-ink">{title}</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">{detail}</p>
      </div>
      <Link to="/" className={buttonVariants({ variant: 'secondary' })}>
        ← Back to dashboard
      </Link>
    </div>
  )
}
