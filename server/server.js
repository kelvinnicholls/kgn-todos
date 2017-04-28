var express = require('express');
var bodyParser = require('body-parser');
const {
  ObjectID
} = require('mongodb');

var {
  mongoose
} = require('./db/mongoose');
var {
  Todo
} = require('./models/todo');
var {
  User
} = require('./models/user');

var app = express();


app.use(bodyParser.json());

app.post('/todos', (req, res) => {
  var todo = new Todo({
    text: req.body.text
  });

  todo.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});


app.get('/todos', (req, res) => {

  Todo.find().then((todos) => {
    res.send({
      todos
    });
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/todos/:id', (req, res) => {
  let {
    id
  } = req.params;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send({
      error: "ID is invalid"
    });
  };

  Todo.findById(id).then((todo) => {
    if (todo) {
      res.send({
        todo
      });
    } else {
      res.status(404).send({
        error: "todo not found for id"
      });
    }

  }, (e) => {
    res.status(400).send(e);
  });
});

let port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

module.exports = {
  app
};