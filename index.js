const express = require("express");
const path = require("path");
const http = require("http");
const router = require("./router");

const app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

app.use("/", router);

http.createServer(app).listen(3000);
