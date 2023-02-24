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
})

//UPDATE A BLOG
blogRouter.put('/:id', async (req, res) => {
  const body = req.body
  const newBlog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0
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