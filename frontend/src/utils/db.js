// IndexedDB helper using idb

import { openDB } from 'idb';

// Use a single object store for all messages, indexed by deviceId
export async function getDB() {
  return openDB('chatlan-messages', 5, {
    upgrade(db, oldVersion) {
      console.log('Upgrading database from version', oldVersion, 'to version 5');
      
      // Handle different upgrade paths
      if (oldVersion < 5) {
        // Delete existing object store if it exists and recreate with proper schema
        if (db.objectStoreNames.contains('messages')) {
          db.deleteObjectStore('messages');
        }
        
        // Create the object store with proper schema
        const store = db.createObjectStore('messages', { keyPath: 'id' });
        store.createIndex('deviceId', 'deviceId', { unique: false });
        console.log('Created messages store with deviceId index');
      }
    },
  });
}



// Save message to the single 'messages' store, always include deviceId
export async function saveMessage(deviceId, message) {
  if (!message.id) {
    message.id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
  }
  message.deviceId = deviceId;
  const db = await getDB();
  try {
    await db.put('messages', message);
    // Debug log
    // console.log('Saved message to store', deviceId, message);
  } catch (e) {
    console.error('Failed to save message to IndexedDB', e, message);
  }
}



// Get all messages for a deviceId from the single store
export async function getAllMessages(deviceId) {
  const db = await getDB();
  try {
    // Use the index to get all messages for this deviceId
    return await db.getAllFromIndex('messages', 'deviceId', deviceId);
  } catch (e) {
    console.error('Failed to get messages from IndexedDB', e);
    return [];
  }
}
