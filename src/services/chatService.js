import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  doc,
  setDoc,
  getDoc,
  limit
} from 'firebase/firestore';

// Helper to generate a consistent private chat ID between two users
export const getPrivateChatId = (uid1, uid2) => {
  return [uid1, uid2].sort().join('_');
};

// Send a message to a course group
export const sendGroupMessage = async (courseName, userId, userName, text) => {
  const sanitizedCourse = courseName.replace(/[^a-zA-Z0-9]/g, '_');
  const messagesRef = collection(db, 'groups', sanitizedCourse, 'messages');
  
  await addDoc(messagesRef, {
    text,
    senderId: userId,
    senderName: userName,
    createdAt: serverTimestamp()
  });
};

// Send a private message to another user
export const sendPrivateMessage = async (currentUserId, currentUserName, targetUserId, targetUserName, text) => {
  const chatId = getPrivateChatId(currentUserId, targetUserId);
  const chatDocRef = doc(db, 'privateChats', chatId);
  
  // Ensure the chat metadata document exists
  const chatDoc = await getDoc(chatDocRef);
  if (!chatDoc.exists()) {
    await setDoc(chatDocRef, {
      users: [currentUserId, targetUserId],
      userNames: {
        [currentUserId]: currentUserName,
        [targetUserId]: targetUserName
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } else {
    // Update the last updated time for sorting recent chats
    await setDoc(chatDocRef, { updatedAt: serverTimestamp() }, { merge: true });
  }

  // Add the actual message
  const messagesRef = collection(db, 'privateChats', chatId, 'messages');
  await addDoc(messagesRef, {
    text,
    senderId: currentUserId,
    createdAt: serverTimestamp()
  });
};

// Listen to group messages in real-time
export const subscribeToGroupMessages = (courseName, callback) => {
  const sanitizedCourse = (courseName || 'General').replace(/[^a-zA-Z0-9]/g, '_');
  const messagesRef = collection(db, 'groups', sanitizedCourse, 'messages');
  const q = query(messagesRef, orderBy('createdAt', 'asc'), limit(100));

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(messages);
  }, (error) => {
    console.error('Error in group message listener:', error);
    // If index is missing, fall back to unordered fetch
    if (error.code === 'failed-precondition') {
      const fallbackQ = query(messagesRef, limit(100));
      onSnapshot(fallbackQ, (snapshot) => {
        const messages = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => {
            const aTime = a.createdAt?.toMillis?.() ?? 0;
            const bTime = b.createdAt?.toMillis?.() ?? 0;
            return aTime - bTime;
          });
        callback(messages);
      });
    }
  });
};

// Listen to private messages in real-time
export const subscribeToPrivateMessages = (currentUserId, targetUserId, callback) => {
  const chatId = getPrivateChatId(currentUserId, targetUserId);
  const messagesRef = collection(db, 'privateChats', chatId, 'messages');
  const q = query(messagesRef, orderBy('createdAt', 'asc'), limit(100));

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(messages);
  }, (error) => {
    console.error('Error in private message listener:', error);
    if (error.code === 'failed-precondition') {
      const fallbackQ = query(messagesRef, limit(100));
      onSnapshot(fallbackQ, (snapshot) => {
        const messages = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => {
            const aTime = a.createdAt?.toMillis?.() ?? 0;
            const bTime = b.createdAt?.toMillis?.() ?? 0;
            return aTime - bTime;
          });
        callback(messages);
      });
    }
  });
};
