const express = require("express");
const router = express.Router();
const UserDAO = require("./Model/User");

router.get("/", (req, res) => {
  res.render("index");
});

router.get("/cadastro", (req, res) => {
  res.render("cadastro");
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/cadastro", async (req, res) => {
  if (req.body) {
    let mensagem = [];
    console.log(req.body);
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
