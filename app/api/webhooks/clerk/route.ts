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
    
    console.log('📥 [WEBHOOK] user.created event received:', { id, email_addresses });
    
    const primaryEmail = email_addresses.find((e) => e.id === evt.data.primary_email_address_id);
    const email = primaryEmail?.email_address;

    if (!email) {
      console.error('❌ [WEBHOOK] No email found for user:', id);
      return new Response(JSON.stringify({ error: 'No email found' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Determine role from metadata or default to STUDENT
    const role = (public_metadata as any)?.role || 'STUDENT';

    try {
      console.log('💾 [WEBHOOK] Attempting to create user in DB:', { id, email, role });
      
      const newUser = await prisma.user.create({
        data: {
          id,
          email,
          name: `${first_name || ''} ${last_name || ''}`.trim() || null,
          role,
          emailVerified: new Date(), // Clerk already verified
          // updatedAt se maneja automáticamente por @updatedAt en schema
        },
      });
      
      console.log('✅ [WEBHOOK] User created successfully in database:', { id, email, dbId: newUser.id });
    } catch (error: any) {
      console.error('❌ [WEBHOOK] Error creating user in database:', {
        message: error?.message,
        code: error?.code,
        meta: error?.meta,
        stack: error?.stack,
      });
      
      // If user already exists, that's okay
      if (error?.code === 'P2002') {
        console.log('⚠️ [WEBHOOK] User already exists (duplicate), skipping:', id);
        return new Response(JSON.stringify({ message: 'User already exists' }), { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Return 500 for real errors so Clerk retries
      return new Response(JSON.stringify({ 
        error: 'Database error', 
        details: error?.message,
        code: error?.code 
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, public_metadata } = evt.data;
    
    console.log('📥 [WEBHOOK] user.updated event received:', { id });
    
    const primaryEmail = email_addresses.find((e) => e.id === evt.data.primary_email_address_id);
    const email = primaryEmail?.email_address;

    if (!email) {
      console.error('❌ [WEBHOOK] No email found for user:', id);
      return new Response(JSON.stringify({ error: 'No email found' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const role = (public_metadata as any)?.role || 'STUDENT';

    try {
      console.log('💾 [WEBHOOK] Attempting to update user in DB:', { id, email });
      
      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          email,
          name: `${first_name || ''} ${last_name || ''}`.trim() || null,
          role,
        },
      });
      
      console.log('✅ [WEBHOOK] User updated successfully in database:', { id, email });
    } catch (error: any) {
      console.error('❌ [WEBHOOK] Error updating user in database:', {
        message: error?.message,
        code: error?.code,
        meta: error?.meta,
      });
      
      return new Response(JSON.stringify({ 
        error: 'Database error', 
        details: error?.message,
        code: error?.code 
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;

    console.log('📥 [WEBHOOK] user.deleted event received:', { id });

    try {
      // Optional: soft delete or hard delete
      await prisma.user.delete({
        where: { id },
      });
      console.log('✅ [WEBHOOK] User deleted from database:', id);
    } catch (error: any) {
      console.error('❌ [WEBHOOK] Error deleting user from database:', {
        message: error?.message,
        code: error?.code,
        meta: error?.meta,
      });
      
      return new Response(JSON.stringify({ 
        error: 'Database error', 
        details: error?.message,
        code: error?.code 
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  console.log('✅ [WEBHOOK] Event processed successfully:', eventType);
  return new Response(JSON.stringify({ success: true, eventType }), { 
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
