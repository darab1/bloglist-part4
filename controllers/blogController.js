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

// GET TOKEN
const getToken = request => {
  const authorization = request.get('authorization')
  console.log('authorization', authorization)

  if (authorization && authorization.startsWith('Bearer ')) {
    console.log(`authorization.split(' ')[1]: `, authorization.split(' ')[1])
    return authorization.split(' ')[1]
  }
  return null
}

// CREATE A NEW BLOG
blogRouter.post('/', async (req, res) => {
  const body = req.body

  const token = getToken(req)
  console.log('token: ', token)
  const decodedToken = jwt.verify(token, process.env.SECRET)
  console.log('decoded token: ', decodedToken)

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
  await Blog.findByIdAndRemove(req.params.id)
  res.status(204).end()
})

module.exports = blogRouter