const mongoose = require('mongoose')

module.exports.createConnection = ({
  uri,
  collections = {},
}) => {
  return new Promise((resolve, reject) => {

    const nonStrictSchema = new mongoose.Schema({}, { strict: false });
    const collection = (name, schemaObject) => {
      const schema = schemaObject || nonStrictSchema;
      const model = mongoose.model(name, schema);

      const insert = (doc) => {
        return new model(doc).save();
      }

      const find = (searchObj) => {
        return model.find(searchObj).exec();
      }

      const findOne = (searchObj) => {
        return model.findOne(searchObj).exec();
      }

      const isExists = (searchObj) => {
        return model.exists(searchObj);
      }

      const remove = (searchObj) => {
        return model.deleteMany(searchObj).exec();
      }

      return {
        model,
        insert,
        find,
        findOne,
        isExists,
        remove,
      }
    }

    const connect = () => {
      return new Promise((resolve_, reject_) => {
        if (!uri) {
          return resolve_(false);
        }
        mongoose.connect(uri, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        })
        mongoose.connection.once('error', reject_);
        mongoose.connection.once('open', () => resolve_(true));
      });
    };

    connect().then((isReal) => {
      console.warn('== MONGO CONNECTION IS SKIPPED!');
      const models = {};
      Object.keys(collections).forEach((collectionName) => {
        models[collectionName] = collection(collectionName, collections[collectionName]);
      });
      resolve({
        isReal,
        ...models,
      });
    }).catch(reject);

  });
};


module.exports.schema = (...args) => new mongoose.Schema(...args);
