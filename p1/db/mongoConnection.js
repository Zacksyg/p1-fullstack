const mongoose = require('mongoose');

class MongoConnection {
  constructor() {
    if (!MongoConnection.instance) {
      MongoConnection.instance = this;
    }
    return MongoConnection.instance;
  }

  async connect() {
    try {
      await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
      console.log('Conectado ao MongoDB');
    } catch (error) {
      console.error('Erro ao conectar ao MongoDB', error);
    }
  }
}

const instance = new MongoConnection();
Object.freeze(instance);

module.exports = instance;
