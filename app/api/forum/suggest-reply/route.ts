// API route for AI-suggested forum replies
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createOpenAIClient } from '../../../../lib/openai-client';
import { getCurrentUserProfile } from '../../../../lib/auth-utils';
import { CacheManager } from '../../../../lib/cache';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { threadTitle, craving, userContent } = await request.json();

    if (!threadTitle || !craving) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user profile
    const userProfile = await getCurrentUserProfile();
    if (!userProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has remaining AI calls
    const openai = createOpenAIClient(userId, userProfile.subscription_tier as 'free' | 'plus' | 'ultra');
    
    if (!openai) {
      console.warn('OpenAI client not available for forum reply suggestion');
      return NextResponse.json(
        { error: 'AI features are currently unavailable' },
        { status: 503 }
      );
    }
    
    const hasRemainingCalls = await openai.hasRemainingCalls();
    
    if (!hasRemainingCalls) {
      return NextResponse.json(
        { error: 'AI suggestion limit reached. Upgrade your plan for more suggestions.' },
        { status: 429 }
      );
    }

    // Check cache first
    const cacheKey = `forum_suggestion:${threadTitle}:${craving}`;
    const cachedSuggestion = await CacheManager.getForumTemplate(cacheKey);
    
    if (cachedSuggestion) {
      return NextResponse.json({ suggestion: cachedSuggestion });
    }

    // Generate AI suggestion
    try {
      const suggestion = await openai.generateForumReply(
        threadTitle,
        craving,
        userContent
      );

      // Cache the suggestion
      await CacheManager.setForumTemplate(cacheKey, suggestion);

      return NextResponse.json({ suggestion });
    } catch (error) {
      console.error('AI suggestion generation failed:', error);
      
      // Return fallback suggestion
      const fallbackSuggestions = {
        nofap: [
          "You're not alone in this journey. Every day is a new opportunity to build the person you want to become. Stay strong! 💪",
          "Remember why you started this journey. Your future self will thank you for the discipline you're building today.",
          "It's okay to struggle - what matters is that you keep trying. Progress isn't always linear, but every effort counts.",
        ],
        sugar: [
          "Sugar cravings are tough, but you're tougher! Try drinking water or eating a piece of fruit when the craving hits.",
          "Your body is adjusting to life without added sugar. The first few days are the hardest, but it gets easier!",
          "Remember, you're not depriving yourself - you're choosing health and energy over temporary satisfaction.",
        ],
        shopping: [
          "Impulse buying can be challenging to overcome. Try the 24-hour rule - wait a day before making any purchase.",
          "Think about what you're really trying to fill with shopping. Sometimes it's about emotions, not needs.",
          "Your future self will thank you for the money you're saving and the financial freedom you're building.",
        ],
        smoking_vaping: [
          "Quitting is one of the hardest things you'll ever do, but also one of the most rewarding. You've got this!",
          "Every hour without smoking is a victory. Celebrate the small wins and keep building momentum.",
          "Your body is healing with every passing day. The cravings will get weaker, but your resolve will get stronger.",
        ],
        social_media: [
          "Social media can be addictive, but you're taking control of your time and attention. That's powerful!",
          "Try replacing social media time with something that adds real value to your life - reading, exercise, or connecting with people in person.",
          "You're not missing out by being offline - you're gaining back your time, focus, and mental clarity.",
        ],
      };

      const fallbackList = fallbackSuggestions[craving as keyof typeof fallbackSuggestions] || fallbackSuggestions.nofap;
      const randomFallback = fallbackList[Math.floor(Math.random() * fallbackList.length)];

      return NextResponse.json({ suggestion: randomFallback });
    }
  } catch (error) {
    console.error('Forum suggestion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

