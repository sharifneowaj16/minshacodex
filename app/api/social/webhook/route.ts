import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const platform = request.headers.get('x-platform') || 'unknown';

    if (platform === 'facebook' || platform === 'instagram') {
      if (body.object === 'page' || body.object === 'instagram') {
        for (const entry of body.entry || []) {
          if (entry.messaging) {
            for (const event of entry.messaging) {
              await processMessage(platform, event);
            }
          }
          if (entry.changes) {
            for (const change of entry.changes) {
              if (change.field === 'comments') {
                await processComment(platform, change.value);
              }
            }
          }
        }
      }
    } else if (platform === 'whatsapp') {
      if (body.entry) {
        for (const entry of body.entry) {
          for (const change of entry.changes || []) {
            if (change.value.messages) {
              for (const message of change.value.messages) {
                await processWhatsAppMessage(message);
              }
            }
          }
        }
      }
    } else if (platform === 'youtube') {
      if (body.feed?.entry) {
        for (const entry of body.feed.entry) {
          await processYouTubeComment(entry);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');
  const verifyToken = process.env.FACEBOOK_VERIFY_TOKEN || 'your_verify_token';

  if (mode === 'subscribe' && token === verifyToken) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

async function processMessage(platform: string, event: any) {
  if (!event.message?.text) return;
  await prisma.socialMessage.create({
    data: {
      platform,
      type: 'message',
      externalId: event.message.mid,
      senderId: event.sender.id,
      content: event.message.text,
      isIncoming: true,
      isRead: false,
      timestamp: new Date(event.timestamp),
    },
  });
}

async function processComment(platform: string, comment: any) {
  if (!comment.message) return;
  await prisma.socialMessage.create({
    data: {
      platform,
      type: 'comment',
      externalId: comment.id,
      postId: comment.post_id,
      senderId: comment.from?.id,
      senderName: comment.from?.name,
      content: comment.message,
      isIncoming: true,
      isRead: false,
      timestamp: new Date(comment.created_time),
    },
  });
}

async function processWhatsAppMessage(message: any) {
  if (!message.text?.body) return;
  await prisma.socialMessage.create({
    data: {
      platform: 'whatsapp',
      type: 'message',
      externalId: message.id,
      senderId: message.from,
      content: message.text.body,
      isIncoming: true,
      isRead: false,
      timestamp: new Date(),
    },
  });
}

async function processYouTubeComment(entry: any) {
  if (!entry.content) return;
  await prisma.socialMessage.create({
    data: {
      platform: 'youtube',
      type: 'comment',
      externalId: entry.id,
      senderId: entry.author?.yt_channelId,
      senderName: entry.author?.name,
      content: entry.content,
      isIncoming: true,
      isRead: false,
      timestamp: new Date(entry.published),
    },
  });
}
// ﻿import { NextRequest, NextResponse } from 'next/server';

// // Webhook endpoint for receiving social media messages/comments
// // Supports Facebook, Instagram, WhatsApp, YouTube

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();
//     const platform = request.headers.get('x-platform') || 'unknown';

//     // Verify webhook signature (implement based on platform)
//     // Facebook/Instagram: X-Hub-Signature-256
//     // WhatsApp: X-Hub-Signature-256
//     // YouTube: X-Goog-Channel-Token

//     console.log(`Received webhook from ${platform}:`, body);

//     // Process different webhook types
//     if (platform === 'facebook' || platform === 'instagram') {
//       // Handle Facebook/Instagram webhooks
//       if (body.object === 'page' || body.object === 'instagram') {
//         for (const entry of body.entry || []) {
//           // Handle messages
//           if (entry.messaging) {
//             for (const event of entry.messaging) {
//               await processMessage(platform, event);
//             }
//           }
//           // Handle comments
//           if (entry.changes) {
//             for (const change of entry.changes) {
//               if (change.field === 'comments') {
//                 await processComment(platform, change.value);
//               }
//             }
//           }
//         }
//       }
//     } else if (platform === 'whatsapp') {
//       // Handle WhatsApp webhooks
//       if (body.entry) {
//         for (const entry of body.entry) {
//           for (const change of entry.changes || []) {
//             if (change.value.messages) {
//               for (const message of change.value.messages) {
//                 await processWhatsAppMessage(message);
//               }
//             }
//           }
//         }
//       }
//     } else if (platform === 'youtube') {
//       // Handle YouTube webhooks
//       if (body.feed?.entry) {
//         for (const entry of body.feed.entry) {
//           await processYouTubeComment(entry);
//         }
//       }
//     }

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error('Webhook error:', error);
//     return NextResponse.json(
//       { error: 'Webhook processing failed' },
//       { status: 500 }
//     );
//   }
// }

// // GET endpoint for webhook verification (Facebook, Instagram)
// export async function GET(request: NextRequest) {
//   const searchParams = request.nextUrl.searchParams;
//   const mode = searchParams.get('hub.mode');
//   const token = searchParams.get('hub.verify_token');
//   const challenge = searchParams.get('hub.challenge');

//   // Verify token (should match your configured token)
//   const verifyToken = process.env.FACEBOOK_VERIFY_TOKEN || 'your_verify_token';

//   if (mode === 'subscribe' && token === verifyToken) {
//     console.log('Webhook verified');
//     return new NextResponse(challenge, { status: 200 });
//   }

//   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
// }

// async function processMessage(platform: string, event: any) {
//   // Save message to database
//   // Send notification to admin
//   // Update unread count
//   console.log(`Processing ${platform} message:`, event);
  
//   // In production, save to database:
//   // await db.socialMessages.create({
//   //   platform,
//   //   type: 'message',
//   //   senderId: event.sender.id,
//   //   content: event.message.text,
//   //   timestamp: new Date(event.timestamp),
//   //   status: 'unread',
//   // });
// }

// async function processComment(platform: string, comment: any) {
//   // Save comment to database
//   // Send notification to admin
//   console.log(`Processing ${platform} comment:`, comment);
  
//   // In production, save to database:
//   // await db.socialMessages.create({
//   //   platform,
//   //   type: 'comment',
//   //   postId: comment.post_id,
//   //   senderId: comment.from.id,
//   //   content: comment.message,
//   //   timestamp: new Date(comment.created_time),
//   //   status: 'unread',
//   // });
// }

// async function processWhatsAppMessage(message: any) {
//   // Save WhatsApp message to database
//   // Send notification to admin
//   console.log('Processing WhatsApp message:', message);
  
//   // In production, save to database:
//   // await db.socialMessages.create({
//   //   platform: 'whatsapp',
//   //   type: 'message',
//   //   senderId: message.from,
//   //   content: message.text.body,
//   //   timestamp: new Date(),
//   //   status: 'unread',
//   // });
// }

// async function processYouTubeComment(entry: any) {
//   // Save YouTube comment to database
//   // Send notification to admin
//   console.log('Processing YouTube comment:', entry);
  
//   // In production, save to database:
//   // await db.socialMessages.create({
//   //   platform: 'youtube',
//   //   type: 'comment',
//   //   videoId: entry.videoId,
//   //   senderId: entry.author.yt_channelId,
//   //   content: entry.content,
//   //   timestamp: new Date(entry.published),
//   //   status: 'unread',
//   // });
// }

