import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your webhook secret
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
  }

  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occured', {
      status: 400,
    })
  }

  // Handle the webhook
  const eventType = evt.type

  if (eventType === 'user.created') {
    const { id, email_addresses, public_metadata } = evt.data

    const email = email_addresses[0]?.email_address

    if (!email) {
      return new Response('No email found', { status: 400 })
    }

    // Get role from metadata (if set during signup)
    const role = (public_metadata?.role as string) || null

    try {
      // Check if user already exists by clerkId or email
      let user = await prisma.user.findFirst({
        where: {
          OR: [
            { clerkId: id },
            { email },
          ],
        },
      })

      if (user) {
        // Update user clerkId and role if it changed or wasn't set
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            clerkId: id,
            role: role ? (role as Role) : user.role,
          },
        })
        console.log(`Updated existing user on user.created webhook: ${user.id} with clerkId ${id}`)
      } else {
        // Create user in database with clerkId
        user = await prisma.user.create({
          data: {
            clerkId: id,
            email,
            role: role ? (role as Role) : null, // Store null if they haven't onboarded yet
          },
        })
        console.log(`Created user in database on user.created webhook: ${user.id} with clerkId ${id} and role ${user.role}`)
      }

      return new Response(JSON.stringify({ success: true, userId: user.id }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    } catch (error) {
      console.error('Error creating/updating user in database:', error)
      return new Response('Error creating user', { status: 500 })
    }
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, public_metadata } = evt.data

    const email = email_addresses[0]?.email_address

    if (!email) {
      return new Response('No email found', { status: 400 })
    }

    const role = public_metadata?.role as string | undefined

    try {
      // Find the user by clerkId or email
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { clerkId: id },
            { email },
          ],
        },
      })

      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            clerkId: id,
            role: role ? (role as Role) : user.role,
          },
        })
        console.log(`Updated user on user.updated webhook: ${email} to role ${role || user.role}`)
      } else {
        // If user doesn't exist, create them
        await prisma.user.create({
          data: {
            clerkId: id,
            email,
            role: role ? (role as Role) : null,
          },
        })
        console.log(`Created user on user.updated webhook: ${email} with role ${role}`)
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    } catch (error) {
      console.error('Error updating user in database:', error)
      return new Response('Error updating user', { status: 500 })
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data

    try {
      console.log(`User deleted from Clerk: ${id}`)

      if (id) {
        const deleteResult = await prisma.user.deleteMany({
          where: { clerkId: id },
        })
        console.log(`Deleted ${deleteResult.count} user(s) from database with clerkId ${id}`)
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    } catch (error) {
      console.error('Error handling user deletion:', error)
      return new Response('Error deleting user', { status: 500 })
    }
  }

  return new Response('Webhook received', { status: 200 })
}
