const MongoDocument = require("./MongoDocument");
module.exports = class Post extends MongoDocument {
  constructor(data) {
    super(data);
    this.title = data.title;
    this.body = data.body;
    this.author = data.author;
    this.image = data.image;
    this._id = data._id;
    this.collection = "posts";
  }

  static find(query = {}, limit = 50) {
    return super.find(query, { name: 1 }, limit, "posts").then(result => {
      return result.map(u => new Post(u));
    });
  }
};
