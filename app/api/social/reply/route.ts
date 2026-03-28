import { NextRequest, NextResponse } from 'next/server';

// API endpoint for replying to social media messages/comments

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform, messageId, conversationId, text, media } = body;

    if (!platform || !text) {
      return NextResponse.json(
        { error: 'Platform and text are required' },
        { status: 400 }
      );
    }

    // Send reply based on platform
    let result;
    switch (platform) {
      case 'facebook':
        result = await sendFacebookReply(messageId, text, media);
        break;
      case 'instagram':
        result = await sendInstagramReply(messageId, text, media);
        break;
      case 'whatsapp':
        result = await sendWhatsAppReply(conversationId, text, media);
        break;
      case 'youtube':
        result = await sendYouTubeReply(messageId, text);
        break;
      default:
        return NextResponse.json(
          { error: 'Unsupported platform' },
          { status: 400 }
        );
    }

    // Save reply to database
    // await db.socialMessages.create({
    //   platform,
    //   type: 'message',
    //   conversationId,
    //   content: text,
    //   isIncoming: false,
    //   timestamp: new Date(),
    //   status: 'sent',
    // });

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Reply error:', error);
    return NextResponse.json(
      { error: 'Failed to send reply' },
      { status: 500 }
    );
  }
}

async function sendFacebookReply(messageId: string, text: string, media?: any[]) {
  // Use Facebook Graph API to send reply
  const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
  
  // For comments:
  // POST https://graph.facebook.com/v18.0/{comment-id}/comments
  
  // For messages:
  // POST https://graph.facebook.com/v18.0/me/messages
  
  const response = await fetch(
    `https://graph.facebook.com/v18.0/${messageId}/comments`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: text,
        access_token: accessToken,
      }),
    }
  );

  return await response.json();
}

async function sendInstagramReply(messageId: string, text: string, media?: any[]) {
  // Use Instagram Graph API to send reply
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  
  // POST https://graph.facebook.com/v18.0/{comment-id}/replies
  
  const response = await fetch(
    `https://graph.facebook.com/v18.0/${messageId}/replies`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: text,
        access_token: accessToken,
      }),
    }
  );

  return await response.json();
}

async function sendWhatsAppReply(conversationId: string, text: string, media?: any[]) {
  // Use WhatsApp Business API to send reply
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  
  // POST https://graph.facebook.com/v18.0/{phone-number-id}/messages
  
  const response = await fetch(
    `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: conversationId,
        type: 'text',
        text: {
          body: text,
        },
      }),
    }
  );

  return await response.json();
}

async function sendYouTubeReply(commentId: string, text: string) {
  // Use YouTube Data API to send reply
  const accessToken = process.env.YOUTUBE_ACCESS_TOKEN;
  
  // POST https://www.googleapis.com/youtube/v3/commentThreads
  
  const response = await fetch(
    'https://www.googleapis.com/youtube/v3/comments',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        snippet: {
          parentId: commentId,
          textOriginal: text,
        },
      }),
    }
  );

  return await response.json();
}

