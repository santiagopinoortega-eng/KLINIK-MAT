// app/api/webhooks/clerk/route.ts
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { WebhookEvent } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Missing CLERK_WEBHOOK_SECRET in environment variables');
  }

  // Get headers
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error: Verification error', {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, public_metadata } = evt.data;
    
    const primaryEmail = email_addresses.find((e) => e.id === evt.data.primary_email_address_id);
    const email = primaryEmail?.email_address;

    if (!email) {
      console.error('No email found for user:', id);
      return new Response('Error: No email found', { status: 400 });
    }

    // Determine role from metadata or default to STUDENT
    const role = (public_metadata as any)?.role || 'STUDENT';

    try {
      await prisma.user.create({
        data: {
          id,
          email,
          name: `${first_name || ''} ${last_name || ''}`.trim() || null,
          role,
          emailVerified: new Date(), // Clerk already verified
        },
      });
      console.log('✅ User created in database:', id, email);
    } catch (error: any) {
      console.error('Error creating user in database:', error?.message);
      // If user already exists, that's okay
      if (error?.code !== 'P2002') {
        return new Response('Error: Database error', { status: 500 });
      }
    }
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, public_metadata } = evt.data;
    
    const primaryEmail = email_addresses.find((e) => e.id === evt.data.primary_email_address_id);
    const email = primaryEmail?.email_address;

    if (!email) {
      console.error('No email found for user:', id);
      return new Response('Error: No email found', { status: 400 });
    }

    const role = (public_metadata as any)?.role || 'STUDENT';

    try {
      await prisma.user.update({
        where: { id },
        data: {
          email,
          name: `${first_name || ''} ${last_name || ''}`.trim() || null,
          role,
        },
      });
      console.log('✅ User updated in database:', id, email);
    } catch (error: any) {
      console.error('Error updating user in database:', error?.message);
      return new Response('Error: Database error', { status: 500 });
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;

    try {
      // Optional: soft delete or hard delete
      await prisma.user.delete({
        where: { id },
      });
      console.log('✅ User deleted from database:', id);
    } catch (error: any) {
      console.error('Error deleting user from database:', error?.message);
      return new Response('Error: Database error', { status: 500 });
    }
  }

  return new Response('', { status: 200 });
}
