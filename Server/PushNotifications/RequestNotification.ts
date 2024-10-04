import { Expo, ExpoPushMessage } from 'expo-server-sdk';

// Create a new Expo SDK client
let expo = new Expo();

export async function requestNotification(senderUsername: string , token: string, message: string): Promise<void> {
  // Create the messages that you want to send to clients
  let messages: ExpoPushMessage[] = [];

  // Check that all your push tokens appear to be valid Expo push tokens
  if (!Expo.isExpoPushToken(token)) {
    console.error(`Push token ${token} is not a valid Expo push token`);
    return;
  }else{
    console.log(`${token} is a valid Expo push token,istoken?`,Expo.isExpoPushToken(token));
    }

  // Construct a message
  messages.push({
    to: token,
    sound: 'default',
    title: `@${senderUsername} has sent you a friend request.`,
    body: message,
    data: { data: 'goes here',_displayInForeground: true  },
  });

  // The Expo push notification service accepts batches of notifications
  let chunks = expo.chunkPushNotifications(messages);
  let tickets: any[] = [];

  // Send the chunks to the Expo push notification service
  for (let chunk of chunks) {
    try {
      let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      console.log(ticketChunk, 'ticketChunk FUE ENVIADO');
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error(error);
    }
  }
}