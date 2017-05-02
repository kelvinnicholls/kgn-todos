const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');


const {
  ObjectID
} = require('mongodb');



let {
  Todo
} = require('./models/todo');
let {
  User
} = require('./models/user');

let {authenticate} = require('../server/middleware/authenticate');

let app = express();

let config = require('./config/config.js')

let {
  mongoose
} = require('./db/mongoose');

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
  var todo = new Todo({
    text: req.body.text
  });

  todo.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send();
  });
});


app.get('/todos', (req, res) => {

  Todo.find().then((todos) => {
    res.send({
      todos
    });
  }, (e) => {
    res.status(400).send();
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
    res.status(400).send();
  });
});


app.delete('/todos/:id', (req, res) => {
  let {
    id
  } = req.params;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send({
      error: "ID is invalid"
    });
  };

  Todo.findByIdAndRemove(id).then((todo) => {
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
    res.status(400).send();
  });
});


app.delete('/todos', (req, res) => {
  Todo.remove({}).then((todos) => {
    if (todos) {
      if (todos.result.n === 0) {
        res.status(404).send({
          error: "No todos deleted"
        });
      } else {
        res.send({
          todos
        });
      }

    } else {
      res.status(400).send({
        error: "No todos deleted"
      });
    }
  }, (e) => {
    res.status(400).send();
  });
});


app.patch('/todos/:id', (req, res) => {
  let {
    id
  } = req.params;

  let body = _.pick(req.body, ['text', 'completed']);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send({
      error: "ID is invalid"
    });
  };

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }


  Todo.findByIdAndUpdate(id, {
    $set: body
  }, {
    new: true
  }).then((todo) => {

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


app.post('/users', (req, res) => {

  let body = _.pick(req.body, ['email', 'password']);
  var user = new User(body);

  user.save().then(() => {
    return user.generateAuthToken();
  }).then((token) => {
    res.header('x-auth', token).send(user);
  }).catch((e) => {
    res.status(400).send();
  });
});


app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

let port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

module.exports = {
  app
};