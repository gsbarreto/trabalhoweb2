let client = require("mongodb").MongoClient;
const config = require("./config");

let conn = client.connect(config.url, config.options).then(conn => {
  return {
    db: conn.db(config.db),
    close: function() {
      conn.close();
    }
  };
});

module.exports = class MongoDocument {
  save() {
    if (this._id) {
      return conn.then(conn => {
        return conn.db
          .collection(this.collection)
          .updateOne({ _id: this._id }, { $set: this });
      });
    }
    return conn.then(conn => {
      return conn.db.collection(this.collection).insertOne(this);
    });
  }

  static find(query = {}, sort = {}, limit = 5, collection) {
    return conn.then(conn => {
      return conn.db
        .collection(collection)
        .find(query)
        .sort(sort)
        .limit(limit)
        .toArray();
    });
  }
};
