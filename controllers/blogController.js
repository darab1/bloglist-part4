const blogRouter = require('express').Router()
const Blog = require('../models/blogModel')

// GET ALL BLOGS
blogRouter.get('/', (req, res) => {
  Blog
    .find({})
    .then(blogs => {
      res.json(blogs)
    })
})

// CREATE A NEW BLOG
blogRouter.post('/', (req, res) => {
  const body = req.body
  
  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0
  })

  blog
    .save()
    .then(savedBlog => {
      res.status(201).json(savedBlog)
    })
    .catch(err => next(err))
})

module.exports = blogRouter