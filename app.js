const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function(req, file, cb){
    cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

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

// About page
app.get('/about', (req, res) => {
  res.render('about');
});

// Contact page
app.get('/contact', (req, res) => {
  res.render('contact');
});

// New post form
app.get('/new', (req, res) => {
  res.render('post');
});

// Create post
app.post('/new', upload.array('images', 15), (req, res) => {
  const { title, content } = req.body;
  const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
  posts.push({ id: idCounter++, title, content, images, comments: [] });
  res.redirect('/');
});

// Edit post form
app.get('/edit/:id', (req, res) => {
  const post = posts.find(p => p.id == req.params.id);
  if (!post) return res.redirect('/');
  res.render('edit', { post });
});

// Update post
app.post('/edit/:id', upload.array('images', 15), (req, res) => {
  const post = posts.find(p => p.id == req.params.id);
  if (post) {
    post.title = req.body.title;
    post.content = req.body.content;

    let existingImages = req.body.existingImages ? req.body.existingImages.split(',') : [];
    const newImages = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
    
    post.images = [...existingImages, ...newImages];
  }
  res.redirect('/');
});

// Delete post
app.post('/delete/:id', (req, res) => {
  posts = posts.filter(p => p.id != req.params.id);
  res.redirect('/');
});

// View single post
app.get('/post/:id', (req, res) => {
  const post = posts.find(p => p.id == req.params.id);
  if (!post) return res.redirect('/');
  res.render('view_post', { post });
});

// Add comment
app.post('/post/:id/comment', (req, res) => {
  const post = posts.find(p => p.id == req.params.id);
  if (post) {
    const { author, content } = req.body;
    post.comments.push({ author, content });
  }
  res.redirect(`/post/${req.params.id}`);
}); 

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 