import Message from '../models/message';

export const getStatus = async (_req, res, users) => {
  const pendingMessages = await Message.estimatedDocumentCount();
  const response = {
    activeConnections: users.size,
    pendingMessages,
  };
  res.json(response);
};

export const cleanPendingMessages = async () => {
  await Message.deleteMany({
    sentAt: {
      $lt: new Date(Date.now() - 604800000 /* one week */),
    },
  });
};
