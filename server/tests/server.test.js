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
  text: "test 1"
  ,_id : new ObjectID()
}, {
  text: "test 2"
  ,_id : new ObjectID()
}, {
  text: "test 3"
  ,_id : new ObjectID()
}, {
  text: "test 4"
  ,_id : new ObjectID()
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
      .get('/todos/'+id)
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
      .get('/todos/'+id)
      .expect(404)
      .expect((res) => {
        expect(res.body.error).toBe("todo not found for id");
      })
      .end(done);
  });

    it('should return 404 of non ObjectID\'s', (done) => {
    let id = 'x';
    request(app)
      .get('/todos/'+id)
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

