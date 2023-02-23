const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blogModel')
const testHelper = require('./test_helper')

const initialBlogs = require('./test_inputs').blogs

beforeEach(async () => {
  await Blog.deleteMany({})

  const blogObjects = initialBlogs
    .map(blog => new Blog(blog))
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)
})

test('all blogs are returned', async () => {
  const res = await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)

  expect(res.body).toHaveLength(initialBlogs.length)
})

test('all blogs contain the id property', async () => {
  const res = await api.get('/api/blogs')

  res.body.forEach(obj => {
    expect(obj.id).toBeDefined()
  })
})

test('a valid blog can be added', async () => {
  const newBlog = {
    title: 'Chainsaw man',
    author: 'Tatsuki Fujimoto',
    url: 'https://chainsawman.com',
    likes: 100
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)
  
  const blogsAfterPost = await testHelper.blogsInDb()
  expect(blogsAfterPost.length).toBe(initialBlogs.length + 1)

  const titles = blogsAfterPost.map(b => b.title)
  expect(titles).toContain(
    'Chainsaw man'
  )
})

afterAll(async () => {
  await mongoose.connection.close()
})