// API route for onboarding personalization
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createOpenAIClient } from '../../../../lib/openai-client';
import { getCurrentUserProfile } from '../../../../lib/auth-utils';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { craving, quizAnswers } = await request.json();

    if (!craving || !quizAnswers) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user profile to determine tier
    let userProfile = await getCurrentUserProfile();
    
    // If user doesn't exist, create them (fallback for webhook failure)
    if (!userProfile) {
      console.log(`No user profile found for personalization: ${userId}, creating fallback user`);
      
      try {
        const { supabaseServer } = await import('../../../../lib/supabase-client');
        const { data: newUser, error: createError } = await supabaseServer
          .from('users')
          .insert({
            clerk_user_id: userId,
            email: '', // Will be updated by Clerk webhook later
            name: 'New User',
            avatar_url: null,
            subscription_tier: 'free',
            xp: 0,
            cravecoins: 0,
            streak_count: 0,
            current_level: 1,
            primary_craving: null,
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating fallback user for personalization:', createError);
          return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
        }

        userProfile = newUser;
        console.log(`Fallback user created for personalization: ${newUser.id}`);
      } catch (error) {
        console.error('Error in fallback user creation for personalization:', error);
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
      }
    }

    // Ensure userProfile exists after fallback creation
    if (!userProfile) {
      console.error('Failed to create or retrieve user profile');
      return NextResponse.json({ error: 'User profile not available' }, { status: 500 });
    }

    // TypeScript assertion: userProfile is guaranteed to exist at this point
    const safeUserProfile = userProfile as NonNullable<typeof userProfile>;
    
    // Create OpenAI client with guaranteed non-null userProfile
    const openai = createOpenAIClient(userId, safeUserProfile.subscription_tier as 'free' | 'plus' | 'ultra');

    // Try AI personalization with fallback
    try {
      if (openai) {
        console.log('Attempting AI personalization...');
        const personalization = await openai.generateOnboardingPersonalization(
          quizAnswers,
          craving
        );
        console.log('AI personalization successful');
        return NextResponse.json(personalization);
      } else {
        console.log('OpenAI client not available, using fallback');
        throw new Error('OpenAI client not available');
      }
    } catch (aiError) {
      console.error('AI personalization failed, using fallback:', aiError);
      
      // FALLBACK: Return hardcoded personalization
      const fallbackPersonalization = {
        introMessage: `Welcome to your ${craving} recovery journey! You've got this!`,
        customHints: [
          `Stay focused on your ${craving} recovery goals`,
          'Take it one day at a time',
          'Celebrate small victories',
          'Remember why you started this journey'
        ]
      };
      
      console.log('Returning fallback personalization');
      return NextResponse.json(fallbackPersonalization);
    }
  } catch (error) {
    console.error('Personalization error:', error);
    
    // Return fallback personalization
    const fallback = {
      introMessage: `Welcome to your journey! You've got this!`,
      customHints: [
        'Start each day with intention',
        'Track your triggers carefully',
        'Celebrate small wins',
      ],
    };

    return NextResponse.json(fallback);
  }
}
