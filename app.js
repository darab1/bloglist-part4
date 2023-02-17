const config = require('./utils/config')
const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const Blog = require('./models/blogModel')
const logger = require('./utils/logger')

mongoose.set('strictQuery', false)

logger.info('Connecting to: ', config.MONGODB_URI)

// CONNECT TO MONGODB
mongoose.connect(config.MONGODB_URI)
  .then(() => {
    logger.info('Connected to MongoDB')
  })
  .catch((err) => {
    logger.error('error while trying to connect to MongoDB', err)
  })

app.use(cors())
app.use(express.json())

// GET ALL BLOGS
app.get('/api/blogs', (request, response) => {
  Blog
    .find({})
    .then(blogs => {
      response.json(blogs)
    })
})

// CREATE A NEW BLOG
app.post('/api/blogs', (request, response) => {
  const body = request.body
  
  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0
  })

  blog
    .save()
    .then(result => {
      response.status(201).json(result)
    })
    .catch(error => console.log('error in creating a new blog: ', error))
})

module.exports = app