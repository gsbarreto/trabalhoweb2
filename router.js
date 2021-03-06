const express = require("express");
const router = express.Router();
const UserDAO = require("./Model/User");
const PostDAO = require("./Model/Post");
const md5 = require("md5");
const jwt = require("jsonwebtoken");
var mongo = require("mongodb");
const multer = require("multer");
const path = require("path");

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "/public/", "uploads"));
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  }
});
var upload = multer({ storage: storage });

const segredo = "ffb22dc9665a677bcbd8fa2bc668e646";
const segredoAdmin = "818121610e1b3dd2f7d2d83c7918bc19";

function verifyJWT(req, res, next) {
  var token = req.cookies && req.cookies.token ? req.cookies.token : undefined;
  if (!token) return res.status(401).send("Usuário não autenticado");

  jwt.verify(token, segredo, function(err, decoded) {
    if (err) return res.status(500).send("Usuário não autenticado");

    req.userId = decoded.id;
    next();
  });
}

function verifyJWTAdmin(req, res, next) {
  var token = req.cookies && req.cookies.admin ? req.cookies.admin : undefined;
  if (!token)
    return res
      .status(401)
      .render("error", { mensagem: ["Usuário não logado"] });

  jwt.verify(token, segredoAdmin, function(err, decoded) {
    if (err) {
      res.clearCookie("admin");
      res.clearCookie("userid");
      res.clearCookie("token");
      return res
        .status(500)
        .render("error", { mensagem: ["Usuário não logado"] });
    }
    req.userId = decoded.id;
    next();
  });
}

router.get("/", (req, res) => {
  if (req.query.search) {
    PostDAO.find({ title: new RegExp(req.query.search) }).then(async items => {
      await Promise.all(
        items.map(async post => {
          const author = await UserDAO.find({
            _id: new mongo.ObjectID(post.author)
          });
          post.author = author[0].name;
        })
      );

      res.render("index", { items });
    });
  } else {
    PostDAO.find({}).then(async items => {
      await Promise.all(
        items.map(async post => {
          const author = await UserDAO.find({
            _id: new mongo.ObjectID(post.author)
          });
          post.author = author[0].name;
        })
      );

      res.render("index", { items });
    });
  }
});

router.get("/busca", (req, res) => {
  if (req.query.parametro && req.query.parametro.length >= 3) {
    PostDAO.find({ title: new RegExp(req.query.parametro) }).then(
      async items => {
        await Promise.all(
          items.map(async post => {
            const author = await UserDAO.find({
              _id: new mongo.ObjectID(post.author)
            });
            post.author = author[0].name;
          })
        );

        res.send(items).toJSON();
      }
    );
  } else {
    res.sendStatus(500);
  }
});

router.route("/admin").get(verifyJWTAdmin, (req, res) => {
  res.render("admin", { user: req.cookies.userid });
});

router
  .route("/admin")
  .post(verifyJWTAdmin, upload.single("imagem"), (req, res) => {
    console.log("BODY", req.body);
    console.log("IMAGEM", req.file);
    if (req.body) {
      let mensagem = [];
      if (
        req.body.title === "" ||
        req.body.title === null ||
        req.body.title === undefined
      ) {
        mensagem.push("O campo titulo é obrigatório!");
      }
      if (
        req.body.body === "" ||
        req.body.body === null ||
        req.body.body === undefined
      ) {
        mensagem.push("O campo corpo é obrigatório!");
      }
      if (
        req.cookies.userid === "" ||
        req.cookies.userid === null ||
        req.cookies.userid === undefined
      ) {
        mensagem.push("Author não informado!");
      }

      if (mensagem.length > 0) {
        res.render("admin", { mensagem });
      } else {
        console.log("FILE", req.file);
        console.log("BODY", req.body);
        let newPost = new PostDAO({
          title: req.body.title,
          body: req.body.body,
          author: req.cookies.userid,
          image: req.file !== undefined ? "/uploads/" + req.file.filename : null
        });

        newPost.save().then(user => {
          res.redirect("/login");
        });
      }
    }
  });

router.get("/cadastro", (req, res) => {
  res.render("cadastro");
});

router.get("/login", (req, res) => {
  if (req.cookies.token) {
    res.redirect("/");
  } else {
    res.render("login");
  }
});

router.get("/logout", function(req, res) {
  res.clearCookie("admin");
  res.clearCookie("token");
  res.clearCookie("userid");
  res.status(200).redirect("/login");
});

router.post("/login", (req, res) => {
  if (req.body) {
    let mensagem = [];
    if (req.body.username === "" || req.body.username === null) {
      mensagem.push("O campo username é obrigatório!");
    }
    if (req.body.password === "" || req.body.password === null) {
      mensagem.push("O campo senha é obrigatório!");
    }

    if (mensagem.length > 0) {
      res.render("login", { mensagem });
    } else {
      UserDAO.find({
        username: req.body.username,
        password: md5("trab@W3B" + req.body.password)
      }).then(result => {
        if (result.length !== 0) {
          const user = result[0];

          var token = jwt.sign({ id: user._id }, segredo, {
            expiresIn: 300
          });

          res.cookie("token", token);
          res.cookie("userid", user._id);
          if (user.admin === true) {
            var tokenAdmin = jwt.sign(
              { id: user._id, password: user.password },
              segredoAdmin,
              {
                expiresIn: 300
              }
            );

            res.cookie("admin", tokenAdmin);
          }

          res.status(200).redirect("/admin");
        } else {
          res.render("login", {
            mensagem: ["Dados de login incorretos!"]
          });
        }
      });
    }
  }
});

router.post("/cadastro", async (req, res) => {
  if (req.body) {
    let mensagem = [];
    if (req.body.name === "" || req.body.name === null) {
      mensagem.push("O campo nome é obrigatório!");
    }

    if (req.body.email === "" || req.body.email === null) {
      mensagem.push("O campo email é obrigatório!");
    }

    if (req.body.password === "" || req.body.password === null) {
      mensagem.push("O campo senha é obrigatório!");
    }

    if (req.body.username === "" || req.body.username === null) {
      mensagem.push("O campo de nome de usuário é obrigatório!");
    }

    if (req.body.password2 === "" || req.body.password2 === null) {
      mensagem.push("O campo de verificação de senha é obrigatório!");
    }

    if (req.body.password !== req.body.password2) {
      mensagem.push("Os campos de senha não coecidem");
    }

    if (mensagem.length > 0) {
      res.render("cadastro", { mensagem });
    } else {
      UserDAO.find({ email: req.body.email }).then(result => {
        if (result.length !== 0) {
          res.render("cadastro", {
            mensagem: ["Email já cadastrado no banco de dados!"]
          });
        } else {
          UserDAO.find({ username: req.body.username }).then(resultUser => {
            if (resultUser.length !== 0) {
              res.render("cadastro", {
                mensagem: ["Nome de usuário já cadastrado no banco de dados!"]
              });
            } else {
              let newUser = new UserDAO({
                name: req.body.name,
                password: req.body.password,
                email: req.body.email,
                username: req.body.username
              });

              newUser.save().then(user => {
                res.redirect("/login");
              });
            }
          });
        }
      });
    }
  } else {
    return res.render("cadastro", { mensagem: ["Preencha todos os dados!"] });
  }
});

module.exports = router;
