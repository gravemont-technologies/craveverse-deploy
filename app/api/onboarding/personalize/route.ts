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
    const userProfile = await getCurrentUserProfile();
    if (!userProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create OpenAI client
    const openai = createOpenAIClient(userId, userProfile.subscription_tier as 'free' | 'plus' | 'ultra');

    // Generate personalization
    const personalization = await openai.generateOnboardingPersonalization(
      quizAnswers,
      craving
    );

    return NextResponse.json(personalization);
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
