const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

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

app.get('/', (req, res) => {
  res.render('index', { posts });
});

app.get('/about', (req, res) => {
  res.render('about');
});

app.get('/contact', (req, res) => {
  res.render('contact');
});

app.get('/new', (req, res) => {
  res.render('post');
});

app.post('/new', upload.array('images', 15), (req, res) => {
  const { title, content } = req.body;
  const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
  posts.push({ id: idCounter++, title, content, images, comments: [] });
  res.redirect('/');
});

app.get('/edit/:id', (req, res) => {
  const post = posts.find(p => p.id == req.params.id);
  if (!post) return res.redirect('/');
  res.render('edit', { post });
});

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

app.post('/delete/:id', (req, res) => {
  const postIndex = posts.findIndex(p => p.id == req.params.id);

  if (postIndex > -1) {
    const post = posts[postIndex];

    if (post.images && post.images.length > 0) {
      post.images.forEach(image => {
        const imagePath = path.join(__dirname, 'public', image);
        fs.unlink(imagePath, (err) => {
          if (err) {
            console.error(`Failed to delete image: ${imagePath}`, err);
          }
        });
      });
    }

    posts.splice(postIndex, 1);
  }

  res.redirect('/');
});

app.get('/post/:id', (req, res) => {
  const post = posts.find(p => p.id == req.params.id);
  if (!post) return res.redirect('/');
  res.render('view_post', { post });
});

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