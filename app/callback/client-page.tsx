'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { exchangeCodeForToken } from '@/app/actions'

export default function CallbackClientPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const code = searchParams.get('code')

    if (code) {
      exchangeCodeForToken(code).catch((err) => {
        console.error(err)
        setError('Failed to exchange code for token.')
      })
    } else {
      setError('No authorization code found.')
    }
  }, [searchParams, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black sm:items-start">
        {
          error ? (
            <div>
              <h1 className="text-red-500">Error</h1>
              <p>{error}</p>
            </div>
          ) : (
            <div>
              <h1 className="text-2xl font-semibold">Authenticating...</h1>
              <p>Please wait while we log you in.</p>
            </div>
          )
        }
      </main>
    </div>
  )
}
