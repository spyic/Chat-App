import { firestore, admin } from '../../config/firebase';
import { FirestoreMessage, PaginatedMessages, LastSeen } from '../../types';
import { logger } from '../../utils/logger';
import { v4 as uuidv4 } from 'uuid';

const FieldValue = admin.firestore.FieldValue;

export const messagesRepository = {
  /**
   * Create a new message in Firestore
   */
  async createMessage(
    chatId: string,
    senderId: string,
    text: string,
    idempotencyKey?: string
  ): Promise<FirestoreMessage> {
    const messageId = idempotencyKey || uuidv4();
    const messageRef = firestore
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .doc(messageId);

    // Check idempotency - if message with this ID already exists, return it
    if (idempotencyKey) {
      const existing = await messageRef.get();
      if (existing.exists) {
        const data = existing.data()!;
        return {
          id: existing.id,
          chatId,
          senderId: data.senderId,
          text: data.text,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          edited: data.edited || false,
          deleted: data.deleted || false,
        };
      }
    }

    const now = FieldValue.serverTimestamp();
    await messageRef.set({
      senderId,
      text,
      createdAt: now,
      updatedAt: now,
      edited: false,
      deleted: false,
    });

    // Read back to get server timestamp
    const saved = await messageRef.get();
    const data = saved.data()!;

    return {
      id: saved.id,
      chatId,
      senderId: data.senderId,
      text: data.text,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      edited: data.edited || false,
      deleted: data.deleted || false,
    };
  },

  /**
   * Get messages with cursor-based pagination
   */
  async getMessages(
    chatId: string,
    limit: number = 50,
    cursor?: string
  ): Promise<PaginatedMessages> {
    const clampedLimit = Math.min(Math.max(limit, 1), 100);

    let query = firestore
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .orderBy('createdAt', 'asc');

    if (cursor) {
      const cursorDoc = await firestore
        .collection('chats')
        .doc(chatId)
        .collection('messages')
        .doc(cursor)
        .get();

      if (cursorDoc.exists) {
        query = query.startAfter(cursorDoc);
      }
    }

    // Fetch one extra to determine hasMore
    const snapshot = await query.limit(clampedLimit + 1).get();

    const messages: FirestoreMessage[] = [];
    const docs = snapshot.docs;
    const hasMore = docs.length > clampedLimit;
    const resultDocs = hasMore ? docs.slice(0, clampedLimit) : docs;

    for (const doc of resultDocs) {
      const data = doc.data();
      messages.push({
        id: doc.id,
        chatId,
        senderId: data.senderId,
        text: data.deleted ? '' : data.text,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        edited: data.edited || false,
        deleted: data.deleted || false,
      });
    }

    const nextCursor = hasMore && resultDocs.length > 0
      ? resultDocs[resultDocs.length - 1].id
      : null;

    return { messages, nextCursor, hasMore };
  },

  /**
   * Get a single message by ID
   */
  async getMessageById(chatId: string, messageId: string): Promise<FirestoreMessage | null> {
    const doc = await firestore
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .doc(messageId)
      .get();

    if (!doc.exists) {
      return null;
    }

    const data = doc.data()!;
    return {
      id: doc.id,
      chatId,
      senderId: data.senderId,
      text: data.deleted ? '' : data.text,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      edited: data.edited || false,
      deleted: data.deleted || false,
    };
  },

  /**
   * Mark a message as read (idempotent)
   */
  async markAsRead(chatId: string, messageId: string, userId: string): Promise<void> {
    const receiptRef = firestore
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .doc(messageId)
      .collection('readReceipts')
      .doc(userId); // Deterministic doc ID for idempotency

    await receiptRef.set(
      { readAt: FieldValue.serverTimestamp() },
      { merge: true } // Idempotent - won't overwrite if exists
    );
  },

  /**
   * Mark a message as delivered (idempotent)
   */
  async markAsDelivered(chatId: string, messageId: string, userId: string): Promise<void> {
    const receiptRef = firestore
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .doc(messageId)
      .collection('deliveryReceipts')
      .doc(userId); // Deterministic doc ID

    await receiptRef.set(
      { deliveredAt: FieldValue.serverTimestamp() },
      { merge: true }
    );
  },

  /**
   * Update last-seen position for a user in a chat
   * Prevents backward movement
   */
  async updateLastSeen(
    chatId: string,
    userId: string,
    messageId: string
  ): Promise<void> {
    const memberRef = firestore
      .collection('chats')
      .doc(chatId)
      .collection('members')
      .doc(userId);

    const existing = await memberRef.get();

    if (existing.exists) {
      const data = existing.data()!;
      const existingMessageId = data.lastSeenMessageId;

      // Prevent backward movement: check if the new message is newer
      if (existingMessageId) {
        const existingMsg = await firestore
          .collection('chats')
          .doc(chatId)
          .collection('messages')
          .doc(existingMessageId)
          .get();

        const newMsg = await firestore
          .collection('chats')
          .doc(chatId)
          .collection('messages')
          .doc(messageId)
          .get();

        if (existingMsg.exists && newMsg.exists) {
          const existingTime = existingMsg.data()?.createdAt?.toDate?.();
          const newTime = newMsg.data()?.createdAt?.toDate?.();
          if (existingTime && newTime && newTime <= existingTime) {
            // New message is older or same — don't move backwards
            return;
          }
        }
      }
    }

    await memberRef.set(
      {
        lastSeenMessageId: messageId,
        lastSeenAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  },

  /**
   * Get last-seen info for a user in a chat
   */
  async getLastSeen(chatId: string, userId: string): Promise<LastSeen | null> {
    const doc = await firestore
      .collection('chats')
      .doc(chatId)
      .collection('members')
      .doc(userId)
      .get();

    if (!doc.exists) return null;

    const data = doc.data()!;
    return {
      lastSeenMessageId: data.lastSeenMessageId,
      lastSeenAt: data.lastSeenAt?.toDate?.()?.toISOString() || '',
    };
  },

  /**
   * Edit a message (only text and updated timestamp)
   */
  async editMessage(chatId: string, messageId: string, newText: string): Promise<FirestoreMessage> {
    const messageRef = firestore
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .doc(messageId);

    await messageRef.update({
      text: newText,
      edited: true,
      updatedAt: FieldValue.serverTimestamp(),
    });

    const updated = await messageRef.get();
    const data = updated.data()!;

    return {
      id: updated.id,
      chatId,
      senderId: data.senderId,
      text: data.text,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      edited: true,
      deleted: false,
    };
  },

  /**
   * Soft delete a message
   */
  async softDeleteMessage(chatId: string, messageId: string): Promise<void> {
    const messageRef = firestore
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .doc(messageId);

    await messageRef.update({
      deleted: true,
      text: '',
      updatedAt: FieldValue.serverTimestamp(),
    });
  },

  /**
   * Get read receipts for a message
   */
  async getReadReceipts(chatId: string, messageId: string): Promise<string[]> {
    const snapshot = await firestore
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .doc(messageId)
      .collection('readReceipts')
      .get();

    return snapshot.docs.map((doc) => doc.id);
  },

  /**
   * Get delivery receipts for a message
   */
  async getDeliveryReceipts(chatId: string, messageId: string): Promise<string[]> {
    const snapshot = await firestore
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .doc(messageId)
      .collection('deliveryReceipts')
      .get();

    return snapshot.docs.map((doc) => doc.id);
  },
};

