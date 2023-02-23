const blogRouter = require('express').Router()
const Blog = require('../models/blogModel')

// GET ALL BLOGS
blogRouter.get('/', async (req, res) => {
  const blogs = await Blog.find({})
  res.status(200).json(blogs)
})

// CREATE A NEW BLOG
blogRouter.post('/', async (req, res) => {
  const body = req.body
  
  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0
  })

  const savedBlog = await blog.save()
  res.status(201).json(savedBlog)

  // blog
  //   .save()
  //   .then(savedBlog => {
  //     res.status(201).json(savedBlog)
  //   })
  //   .catch(err => next(err))
})

module.exports = blogRouter