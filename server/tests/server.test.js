const expect = require('expect');
const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const {
  ObjectID
} = require('mongodb');

const {
  app
} = require('./../server');
const {
  Todo
} = require('./../models/todo');

const {
  User,
  seed
} = require('./../models/user');

const {
  todos,
  populateTodos,
  populateUsers,
  users
} = require('./seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('GET /todos', () => {
  it('should get all todos', (done) => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(4);
      })
      .end(done);
  });
});

describe('GET /todos/:id', () => {
  it('should get todo for id', (done) => {
    let id = todos[0]._id.toHexString();
    let text = todos[0].text;
    request(app)
      .get('/todos/' + id)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toBe(id);
        expect(res.body.todo.text).toBe(text);
      })
      .end(done);
  });

  it('should return 404 if todo not found', (done) => {
    let id = new ObjectID().toHexString();
    request(app)
      .get('/todos/' + id)
      .expect(404)
      .expect((res) => {
        expect(res.body.error).toBe("todo not found for id");
      })
      .end(done);
  });

  it('should return 404 of non ObjectID\'s', (done) => {
    let id = 'x';
    request(app)
      .get('/todos/' + id)
      .expect(404)
      .expect((res) => {
        expect(res.body.error).toBe("ID is invalid");
      })
      .end(done);
  });
});

describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    var text = 'Test todo text';

    request(app)
      .post('/todos')
      .send({
        text
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find({
          text
        }).then((todos) => {
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not create todo with invalid body data', (done) => {
    request(app)
      .post('/todos')
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find().then((todos) => {
          expect(todos.length).toBe(4);
          done();
        }).catch((e) => done(e));
      });
  });
});


describe('DELETE /todos', () => {
  it('should delete all todos', (done) => {
    request(app)
      .delete('/todos')
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.n).toBe(4);
      })
      .end(done);
  });
});

describe('DELETE /todos/:id', () => {
  it('should delete todo for id', (done) => {
    let id = todos[0]._id.toHexString();
    let text = todos[0].text;
    request(app)
      .delete('/todos/' + id)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toBe(id);
        expect(res.body.todo.text).toBe(text);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(id).then((todo) => {
          expect(todo).toNotExist();
          done();
        }).catch((e) => done(e));

      });
  });

  it('should return 404 if todo not found', (done) => {
    let id = new ObjectID().toHexString();
    request(app)
      .delete('/todos/' + id)
      .expect(404)
      .expect((res) => {
        expect(res.body.error).toBe("todo not found for id");
      })
      .end(done);
  });

  it('should return 404 of non ObjectID\'s', (done) => {
    let id = 'x';
    request(app)
      .delete('/todos/' + id)
      .expect(404)
      .expect((res) => {
        expect(res.body.error).toBe("ID is invalid");
      })
      .end(done);
  });
});


describe('UPDATE /todos/:id', () => {

  let todo = todos[0];
  let oldText = todos[0].text;
  let newText = todos[0].text + ' UPDATED';
  todo.text = newText;
  it('should update todo for id', (done) => {
    let id = todos[0]._id.toHexString();
    request(app)
      .patch('/todos/' + id)
      .send(todo)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toBe(id);
        expect(res.body.todo.text).toBe(newText);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(id).then((todo) => {
          expect(todo.text).toBe(newText);
          done();
        }).catch((e) => done(e));

      });
  });

  it('should set completedAt if completed', (done) => {
    let id = todos[0]._id.toHexString();
    todo.completed = true;
    request(app)
      .patch('/todos/' + id)
      .send(todo)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(newText);
        expect(res.body.todo.completedAt).toBeA('number');
        expect(res.body.todo.completed).toBe(true);
      })
      .end(done);
  });

  it('should not set completedAt if not completed', (done) => {
    let id = todos[1]._id.toHexString();
    todo.completed = false;
    request(app)
      .patch('/todos/' + id)
      .send(todo)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(newText);
        expect(res.body.todo.completed).toBe(false);
        expect(res.body.todo.completedAt).toBe(null);
      })
      .end(done);
  });


  it('should return 404 if todo not found', (done) => {
    let id = new ObjectID().toHexString();
    request(app)
      .patch('/todos/' + id)
      .send(todo)
      .expect(404)
      .expect((res) => {
        expect(res.body.error).toBe("todo not found for id");
      })
      .end(done);
  });

  it('should return 404 of non ObjectID\'s', (done) => {
    let id = 'x';
    request(app)
      .patch('/todos/' + id)
      .send(todo)
      .expect(404)
      .expect((res) => {
        expect(res.body.error).toBe("ID is invalid");
      })
      .end(done);
  });
});


describe('GET /users/me', () => {

  it('should return user if authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(users[0]._id.toString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);
  });

  it('should return 401 if not authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set({
        'x-auth': 'xx'
      })
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });

});


describe('POST /users', () => {
  it('should create a user', (done) => {
    let email = 'email3@email.com';
    let password = 'email3.password';
    let user = {
      email,
      password
    };
    request(app)
      .post('/users/')
      .send(user)
      .expect(200)
      .expect((res) => {
        expect(res.body.email).toBe(email);
        let access = 'auth';
        console.log("res.body", res.body);
        console.log("res.body.user", res.body.user);
        let token = jwt.sign({
          _id: res.body._id,
          access
        }, seed).toString();
        //expect(res.body.tokens[0].token).toBe(token);
        expect(res.body._id).toExist();
        expect(res.headers['x-auth']).toExist();
        // let hashedPassword = '';
        // bcrypt.genSalt(10, (err, salt) => {
        //   if (!err) {
        //     bcrypt.hash(password, salt, (err, hash) => {
        //       if (!err) {
        //         hashedPassword = hash;
        //       }
        //     });
        //   }
        // });

        //expect(res.body.password).toBe(hashedPassword);
      })
      .end((err) => {
        if (err) {
          return done(err);
        }
        User.findOne({email}).then((user) => {
          expect(user).toExist();
          expect(user.email).toBe(email);
          expect(user.password).toNotBe(password);
          done();
        }).catch((e) => done(e));
      });
  });
  it('should return validation errors if request invalid', (done) => {
    let email = 'email4.email.com';
    let password = 'email4.password';
    request(app)
      .post('/users/')
      .send({
        email,
        password
      })
      .expect(400)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
  it('should not create a user if email in use', (done) => {
    let email = users[0].email;
    let password = users[0].password;
    request(app)
      .post('/users/')
      .send({
        email,
        password
      })
      .expect(400)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});


describe('POST /users/login', () => {
  it('should login user and return auth token', (done) => {
    let email = users[1].email;
    let password = users[1].password;
    request(app)
      .post('/users/login')
      .send({
        email,
        password
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.email).toBe(users[1].email);
        expect(res.headers['x-auth']).toExist();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        User.findById(users[1]._id).then((user) => {
          expect(user.tokens[0]).toInclude({
            access: 'auth'
            , token: res.headers['x-auth']
          });
          done();
        }).catch((e) => done(e));
      });
  });

  it('should reject invalid login (password)', (done) => {
    let email = users[1].email;
    let password = users[1].password + "x";
    request(app)
      .post('/users/login')
      .send({
        email,
        password
      })
      .expect(400)
      .expect((res) => {
        expect(res.headers['x-auth']).toNotExist();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        User.findById(users[1]._id).then((user) => {
          expect(user.tokens.length).toBe(0);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should reject invalid login (email)', (done) => {
    let email = users[1].email + "x";
    let password = users[1].password;
    request(app)
      .post('/users/login')
      .send({
        email,
        password
      })
      .expect(400)
      .expect((res) => {
        expect(res.headers['x-auth']).toNotExist();
      })
      .end(done);
  });
});