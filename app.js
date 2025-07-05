const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

let posts = [];
let idCounter = 1;

// Home page - list all posts
app.get('/', (req, res) => {
  res.render('index', { posts });
});

// New post form
app.get('/new', (req, res) => {
  res.render('post');
});

// Create post
app.post('/new', (req, res) => {
  const { title, content } = req.body;
  posts.push({ id: idCounter++, title, content });
  res.redirect('/');
});

// Edit post form
app.get('/edit/:id', (req, res) => {
  const post = posts.find(p => p.id == req.params.id);
  if (!post) return res.redirect('/');
  res.render('edit', { post });
});

// Update post
app.post('/edit/:id', (req, res) => {
  const post = posts.find(p => p.id == req.params.id);
  if (post) {
    post.title = req.body.title;
    post.content = req.body.content;
  }
  res.redirect('/');
});

// Delete post
app.post('/delete/:id', (req, res) => {
  posts = posts.filter(p => p.id != req.params.id);
  res.redirect('/');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 