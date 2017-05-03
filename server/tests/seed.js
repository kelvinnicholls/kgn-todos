const {
    ObjectID
} = require('mongodb');
const {
    Todo
} = require('../models/todo');
const {
    User,
    seed
} = require('../models/user');
const jwt = require('jsonwebtoken');

const user1Id = new ObjectID();
const user1email = "email1@email.com";
const user1password = "email1.password";

const user2Id = new ObjectID();
const user2email = "email2@email.com";
const user2password = "email2.password";

// const users = [{
//         _id: user1Id,
//         email: user1email,
//         password: user1password,
//         tokens: [{
//             access: 'auth',
//             token: jwt.sign({
//                 _id: user1Id.toHexString(),
//                 access: 'auth'
//             }, seed).toString()
//         }]
//     },
//     {
//         _id: user2Id,
//         email: user2email,
//         password: user2password,
//         tokens: [{
//             access: 'auth',
//             token: jwt.sign({
//                 _id: user1Id.toHexString(),
//                 access: 'auth'
//             }, seed).toString()
//         }]
//     }
// ];

const users = [{
        _id: user1Id,
        email: user1email,
        password: user1password,
        tokens: [{
            access: 'auth',
            token: jwt.sign({
                _id: user1Id.toHexString(),
                access: 'auth'
            }, seed).toString()
        }]
    },
    {
        _id: user2Id,
        email: user2email,
        password: user2password,
        tokens: [{
            access: 'auth',
            token: jwt.sign({
                _id: user2Id.toHexString(),
                access: 'auth'
            }, seed).toString()
        }]
    }
];

const todos = [{
    text: "test 1",
    completed: true,
    _id: new ObjectID(),
    _creator: user1Id
}, {
    text: "test 2",
    completed: false,
    _id: new ObjectID(),
    _creator: user2Id
}, {
    text: "test 3",
    completed: true,
    _id: new ObjectID(),
    _creator: user1Id
}, {
    text: "test 4",
    completed: false,
    _id: new ObjectID(),
    _creator: user2Id
}];

const populateTodos = (done) => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(todos);
    }).then(() => done());
};

const populateUsers = (done) => {
    User.remove({}).then(() => {
        // return User.insertMany(users); // does not run mongoose middleware
        let user1 = new User(users[0]).save();
        let user2 = new User(users[1]).save();
        return Promise.all([user1, user2]); // returns after both passed promises finish and calls middleware
    }).then(() => done()).catch((err) => {
        console.log("populateUsers", err);
    });
};

module.exports = {
    todos,
    users,
    populateTodos,
    populateUsers
};