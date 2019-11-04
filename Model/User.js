const MongoDocument = require("./MongoDocument");
const md5 = require("md5");
module.exports = class User extends MongoDocument {
  constructor(data) {
    super(data);
    this.name = data.name;
    this.password = md5("trab@W3B" + data.password);
    this.admin = false;
    this.username = data.username;
    this.email = data.email;
    this._id = data._id;
    this.collection = "users";
    console.log(data);
  }

  static find(query = {}, limit = 5) {
    return super.find(query, { name: 1 }, limit, "users").then(result => {
      return result.map(u => new User(u));
    });
  }
};
