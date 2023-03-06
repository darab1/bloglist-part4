const blogRouter = require('express').Router()
const Blog = require('../models/blogModel')
const User = require('../models/userModel')
const jwt = require('jsonwebtoken')

// GET ALL BLOGS
blogRouter.get('/', async (req, res) => {
  const blogs = await Blog
    .find({})
    .populate('user', { username: 1, name: 1 })

  res.status(200).json(blogs)
})

// CREATE A NEW BLOG
blogRouter.post('/', async (req, res) => {
  const body = req.body

  const decodedToken = jwt.verify(req.token, process.env.SECRET)

  if (!decodedToken.id) {
    return res.status(401).json({
      error: 'invalid token'
    })
  }
  
  const user = await User.findById(decodedToken.id)
  
  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    user: user._id
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  res.status(201).json(savedBlog)
})

//UPDATE A BLOG
blogRouter.put('/:id', async (req, res) => {
  const body = req.body

  const newBlog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0, 
  }

  const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, newBlog, { new: true })

  res.status(200).json(updatedBlog)
})

// DELETE A BLOG
blogRouter.delete('/:id', async (req, res) => {
  // await Blog.findByIdAndRemove(req.params.id)
  // res.status(204).end()

  // 1) get the userId by using the req.params.id value to get the
  // blog from the db which contains the user field
  const blog = await Blog.findById(req.params.id)
  
  // 2) get the id of the user from decoding the token 
  const decodedToken = await jwt.verify(req.token, process.env.SECRET)

  if (!decodedToken.id) {
    return res.status(401).json({
      error: 'invalid token'
    })
  }

  const userId = decodedToken.id

  // 3) compare the two ids
  // if they are equal, delete the blog otherwise send a 
  // proper status code if user is invalid
  if (!(blog.user.toString() === userId.toString())) {
    return res.status(401).json({
      error: 'invalid user'
    })
  }

  await Blog.findByIdAndRemove(req.params.id)
  res.status(204).end()
})

module.exports = blogRouter