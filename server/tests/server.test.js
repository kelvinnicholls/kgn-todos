const expect = require('expect');
const request = require('supertest');
const {
  ObjectID
} = require('mongodb');

const {
  app
} = require('./../server');
const {
  Todo
} = require('./../models/todo');

const todos = [{
  text: "test 1",
  completed: true,
  _id: new ObjectID()
}, {
  text: "test 2",
  completed: false,
  _id: new ObjectID()
}, {
  text: "test 3",
  completed: true,
  _id: new ObjectID()
}, {
  text: "test 4",
  completed: false,
  _id: new ObjectID()
}];

beforeEach((done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos);
  }).then(() => done());
});

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