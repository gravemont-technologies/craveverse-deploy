// Clerk webhook handler for user events
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { supabaseServer } from '@/lib/supabase-client';


export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.text();
  const body = JSON.parse(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    
    try {
      // Create user profile in Supabase
      const { error } = await supabaseServer
        .from('users')
        .insert({
          clerk_user_id: id,
          email: email_addresses[0]?.email_address,
          name: `${first_name || ''} ${last_name || ''}`.trim(),
          avatar_url: image_url,
          subscription_tier: 'free',
          xp: 0,
          cravecoins: 0,
          streak_count: 0,
          current_level: 1,
        });

      if (error) {
        console.error('Error creating user profile:', error);
        return new Response('Error creating user profile', {
          status: 500,
        });
      }

      console.log(`User profile created for ${id}`);
    } catch (error) {
      console.error('Error in user.created webhook:', error);
      return new Response('Error processing webhook', {
        status: 500,
    });
    }
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    
    try {
      // Update user profile in Supabase
      const { error } = await supabaseServer
        .from('users')
        .update({
          email: email_addresses[0]?.email_address,
          name: `${first_name || ''} ${last_name || ''}`.trim(),
          avatar_url: image_url,
        })
        .eq('clerk_user_id', id);

      if (error) {
        console.error('Error updating user profile:', error);
        return new Response('Error updating user profile', {
          status: 500,
        });
      }

      console.log(`User profile updated for ${id}`);
    } catch (error) {
      console.error('Error in user.updated webhook:', error);
      return new Response('Error processing webhook', {
        status: 500,
      });
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;
    
    try {
      // Delete user profile and related data from Supabase
      const { error } = await supabaseServer
        .from('users')
        .delete()
        .eq('clerk_user_id', id);

      if (error) {
        console.error('Error deleting user profile:', error);
        return new Response('Error deleting user profile', {
          status: 500,
        });
      }

      console.log(`User profile deleted for ${id}`);
    } catch (error) {
      console.error('Error in user.deleted webhook:', error);
      return new Response('Error processing webhook', {
        status: 500,
      });
    }
  }

  return new Response('', { status: 200 });
}
