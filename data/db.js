const { MongoClient } = require("mongodb");
const uri = process.env.ATLAS_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let database;

module.exports = {
  connectToDatabase: function (callback) {
    client.connect(function (err, db) {
      if (err || !db) {
        return callback(err);
      }

      database = db.db("seguroDb");
      console.log("Successfully connected to MongoDB.");

      return callback();
    });
  },

  getDb: function () {
    return database;
  },
};
