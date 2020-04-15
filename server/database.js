const mongo = require('./utils/mongo.js');

module.exports = async () => {
  const messageUserSchema = {
    username: String,
    type: String,
  };
  return await mongo.createConnection({
    uri: process.env.VISKA_MONGO_URI,
    collections: {
      users: mongo.schema({
        type: {
          type: String,
          default: () => 'persist' // or temporary
        },
        username: {
          type: String,
          required: true,
          unique: true,
        },
        password: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: () => {
            return new Date();
          },
        },
      }),
      pendingMessages: mongo.schema({
        from: mongo.schema(messageUserSchema),
        to: mongo.schema(messageUserSchema),
        body: {
          type: String,
        },
        date: {
          type: Date,
          default: () => {
            return new Date();
          },
        }
      }),
    }
  });
}
