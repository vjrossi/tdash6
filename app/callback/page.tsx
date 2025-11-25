import { Suspense } from 'react'
import CallbackClientPage from './client-page'

function Loading() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
            <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black sm:items-start">
                <h1 className="text-2xl font-semibold">Authenticating...</h1>
                <p>Please wait while we log you in.</p>
            </main>
        </div>
    )
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<Loading/>}>
      <CallbackClientPage />
    </Suspense>
  )
}
