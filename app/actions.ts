'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function exchangeCodeForToken(code: string) {
  const tokenUrl = 'https://auth.tesla.com/oauth2/v3/token'

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      client_id: process.env.NEXT_PUBLIC_TESLA_CLIENT_ID,
      client_secret: process.env.TESLA_CLIENT_SECRET,
      code: code,
      redirect_uri: process.env.NEXT_PUBLIC_TESLA_REDIRECT_URI,
      scope: 'openid vehicle_device_data vehicle_cmds vehicle_charging_cmds',
    }),
  })

  const data = await response.json()

  if (data.access_token) {
    // In a real app, you would store the access token securely, 
    // likely in an encrypted cookie or a database.
    // For this example, we'll just redirect to the dashboard.
    console.log("Access Token:", data.access_token);
  } else {
    console.error("Error exchanging code for token:", data);
  }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}
