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

// TESTING GETTING ALL BLOGS IN DB
test('all blogs are returned', async () => {
  const res = await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)

  expect(res.body).toHaveLength(initialBlogs.length)
})

// TESTING THE EXISTENCE OF THE ID PROPERTY
test('all blogs contain the id property', async () => {
  const res = await api.get('/api/blogs')

  res.body.forEach(obj => {
    expect(obj.id).toBeDefined()
  })
})

// TESTING CREATION OF A NEW BLOG
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

test('if the likes property is missing it will default to 0', async () => {
  const newBlog = {
    title: 'Chainsaw man',
    author: 'Tatsuki Fujimoto',
    url: 'https://chainsawman.com'
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAfterPost = await testHelper.blogsInDb()
  
  expect(blogsAfterPost[blogsAfterPost.length - 1].likes).toBe(0)
})

test('if the title is missing send 400 Bad Request', async () => {
  const newBlog = {
    author: 'Tatsuki Fujimoto',
    url: 'https://chainsawman.com'
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)

  const blogsAfterPost = await testHelper.blogsInDb()
  expect(blogsAfterPost.length).toBe(initialBlogs.length)
})

test('if the url is missing send 400 Bad Request', async () => {
  const newBlog = {
    title: 'Chainsaw man',
    author: 'Tatsuki Fujimoto',
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)

  const blogsAfterPost = await testHelper.blogsInDb()
  expect(blogsAfterPost.length).toBe(initialBlogs.length)
})

// TESTING DELETION OF A BLOG
describe('deletion of a blog', () => {
  test('succeeds with a valid id', async () => {
    const blogsAtStart = await testHelper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)

    const blogsAfterDeletion = await testHelper.blogsInDb()
    expect(blogsAfterDeletion).toHaveLength(initialBlogs.length - 1)

    const titles = blogsAfterDeletion.map(blog => blog.title)
    expect(titles).not.toContain(blogToDelete.title)
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})