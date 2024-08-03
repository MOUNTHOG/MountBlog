import express from 'express';
import Post from '../models/Post.js'; 
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const adminLayout = '../views/layouts/admin.ejs';
const jwtSecret = process.env.JWT_SECRET;



const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized' });
  }
}


router.get('/admin/', async (req, res) => {
  try {
    const locals = {
      title: "NodeJs Blog",
      description: "Simple Blog created with NodeJs, Express & MongoDb."
    };
    res.render('admin/signin', { layout: adminLayout });
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
});


router.post('/admin/', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await User.findOne( { username } );

    if(!user) {
      return res.render('error/invalid');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if(!isPasswordValid) {
      return res.render('error/invalid');
    }
    const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '15m' });
    
    res.cookie('token', token, { httpOnly: true });
    
    res.redirect('/dashboard');

  } catch (error) {
    console.log(error);
  }
});

router.get('/admin/register', async (req, res) => {
  try {
    const locals = {
      title: "NodeJs Blog",
      description: "Simple Blog created with NodeJs, Express & MongoDb."
    };
    res.render('admin/signup', { layout: adminLayout });
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
    
  }
});

router.post('/register', async (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const user = await User.create({name, username, email, password: hashedPassword });
      res.redirect('/admin/',);
    } catch (error) {
      if (error.code === 11000) {
        res.render('error/userexist')
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/dashboard',authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: 'Dashboard',
      description: 'Simple Blog created with NodeJs, Express & MongoDb.'
    }

    const data = await Post.find({ author: req.user._id });
    const user = await User.findById(req.user._id);
    res.render('admin/dashboard', {
      data,
      user,
      layout: adminLayout
    });

  } catch (error) {
    console.log(error);
  }

});

router.get('/post/:id', async (req,res) => {
  try {
      let slug = req.params.id
      const data = await Post.findById({_id: slug});
      const user = await User.findById(data.author);
      res.render('admin/post', {
        layout: adminLayout,
        data,
        user
      });
  } catch (error) {
      console.log(error);
  }
  
});

router.get('/add-post',authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: 'Add Post',
      description: 'Simple Blog created with NodeJs, Express & MongoDb.'
    }

    const data = await Post.find();
    
    res.render('admin/add-post', {
      data,
      layout: adminLayout
    });

  } catch (error) {
    console.log(error);
  }

});

router.post('/add-post',authMiddleware, async (req, res) => {
  try{
    try {
    const locals = {
      title: 'Add Post',
      description: 'Simple Blog created with NodeJs, Express & MongoDb.'
    }
    const {title, body} = req.body;
    
    
    const add_post = await Post.create({ title, body, author: req.user._id  });

    res.redirect('/dashboard');

  } catch (error) {
    console.log(error);
  }
  } catch (error){
    console.log(error)
  }
});

router.get('/edit-post/:id',authMiddleware, async (req, res) => {
  try {
    const data = await Post.findById({_id: req.params.id});
    
    res.render('admin/edit-post',{
      data,
      layout: adminLayout
    });
  } catch (error) {
    console.log(error);
  }

});

router.put('/edit-post/:id',authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: 'Edit Post',
      description: 'Simple Blog created with NodeJs, Express & MongoDb.'
    }

    const edit_post = await Post.findByIdAndUpdate(req.params.id ,{
      title: req.body.title,
      body: req.body.body,
      upDatedAt: Date.now()
    });
    const data = await Post.findById({_id: req.params.id});
    const user = await User.findById(data.author);
    res.render('post',{
      layout: adminLayout,
      data,
      user
    });

  } catch (error) {
    console.log(error);
  }

});

router.delete('/delete-post/:id',authMiddleware, async (req, res) => {
  try {
    const delete_post = await Post.deleteOne({_id: req.params.id});
    res.redirect('/dashboard');
  } catch (error) {
    console.log(error);
  }
})




router.get('/logout', (req,res)=>{
  res.clearCookie('token');
  
  res.redirect('/');
});


export default router;
