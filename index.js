const express = require("express");
const path = require("path");
const http = require("http");
const router = require("./router");
const cookieParser = require("cookie-parser");
const app = express();
const bodyParser = require("body-parser");

app.use(cookieParser());

var porta = process.env.PORT || 3000;

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(express.static("public"));

app.use("/", router);

http.createServer(app).listen(porta);
