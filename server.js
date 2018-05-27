'use strict';

const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const { DATABASE_URL,PORT } = require('./config');
const { BlogPost } = require('./models');

mongoose.connect(DATABASE_URL);

const app = express();

app.use(morgan('common'));
app.use(express.json());

//Get posts
app.get('/posts', (req,res) => {
  BlogPost
  .find()
  .then(posts => {
    res.status(200).json(posts.map(post => post.serialize()));
  })
  .catch(err => {
    console.error(err);
    res.status(500).json('Something ent wrong , papi');
  });
});

//Get posts by id
app.get('/posts/:id', (req,res) => {
  BlogPost
  .findByID(req.params.id)
  .then(post => res.json(post.serialize()))
  .catch(err => {
    console.error(err);
    res.status(500).json('Something ent wrong , papi');
  });
});

//Create Request
app.post('/posts', (req,res) => {
  const requiredFields = ['title','content','author'];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if(!(field in req.body)) {
      const message = `You're missing ${field} in the request, papi.`;
      console.error(message);
      return res.status(400).send(message);
    }
  }

  BlogPost
  .create({
    title: req.body.title,
    content: req.body.content,
    author: req.body.author
  })
  .then(post => res.status(201).json(post.serialize()))
  .catch(err => {
    console.error(err);
    res.status(500).json('Something ent wrong , papi');
  });
});

//Update
app.put('/posts/:id', (req,res) => {
  if(!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    res.status(400).json({error: 'ID was not found, papi.'});
  }

  const updatedPost = {};
  const youCanUpdate = ['title','content','author'];
  youCanUpdate.forEach(field => {
    if (field in req.body) {
      updatedPost[field] = req.body[field];
    }
  });

  BlogPost
  .findByIdAndUpdate(req.params.id, {$set: updatedPost}, {new: true})
  .then(updatedPost => res.status(204).json({message:'Update successful'}))
  .catch(err => {
    console.error(err);
    res.status(500).json('Something ent wrong , papi');
  });
});

//Delete
app.delete('/posts/:id', (req,res) => {
  BlogPost
  .findByIdAndRemove(req.params.id)
  .then(res.status(204).json({message:'Deletion was a success'}))
  .catch(err => {
    console.error(err);
    res.status(500).json('Something ent wrong , papi');
  });
});

app.use('*', function (req, res) {
  res.status(404).json({ message: 'Not Found' });
});

app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`);
});






// let server;
//
// // this function connects to our database, then starts the server
// function runServer(databaseUrl, port = PORT) {
//   return new Promise((resolve, reject) => {
//     mongoose.connect(databaseUrl, err => {
//       if (err) {
//         return reject(err);
//       }
//       server = app.listen(port, () => {
//         console.log(`Your app is listening on port ${port}`);
//         resolve();
//       })
//         .on('error', err => {
//           mongoose.disconnect();
//           reject(err);
//         });
//     });
//   });
// }
//
// // this function closes the server, and returns a promise. we'll
// // use it in our integration tests later.
// function closeServer() {
//   return mongoose.disconnect().then(() => {
//     return new Promise((resolve, reject) => {
//       console.log('Closing server');
//       server.close(err => {
//         if (err) {
//           return reject(err);
//         }
//         resolve();
//       });
//     });
//   });
// }
//
// // if server.js is called directly (aka, with `node server.js`), this block
// // runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
// if (require.main === module) {
//   runServer(DATABASE_URL).catch(err => console.error(err));
// }
//
// module.exports = { runServer, app, closeServer };
