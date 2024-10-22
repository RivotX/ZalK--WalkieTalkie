import { Expo, ExpoPushMessage } from 'expo-server-sdk';

// Create a new Expo SDK client
let expo = new Expo();

export async function AudioNotification(senderUsername: string , token: string, audioData: string): Promise<void> {
  // Create the messages that you want to send to clients
  let messages: ExpoPushMessage[] = [];

  // Check that all your push tokens appear to be valid Expo push tokens
  if (!Expo.isExpoPushToken(token)) {
    console.error(`Push token ${token} is not a valid`);
    return;
  }else{
    console.log(`the token is valid`);
    console.log("Audio a enviar: ",audioData)
    }

  // Construct a message
  messages.push({
    to: token,
    sound: 'default',
    title: `@${senderUsername} is currently speaking.`,
    body: "Walkie Talkie",
    data: {data : `DATA FROM NOTIFICATION`},
    // Asegúrate de que la notificación se muestre en primer plano
  });

  // The Expo push notification service accepts batches of notifications
  let chunks = expo.chunkPushNotifications(messages);
  let tickets: any[] = [];

  // Send the chunks to the Expo push notification service
  for (let chunk of chunks) {
    try {
      let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      console.log('ticketChunk FUE ENVIADO AUDIO');
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error(error);
    }
  }
}