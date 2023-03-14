const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app')
const api = supertest(app)
const bcrypt = require('bcrypt')
const Blog = require('../models/blogModel')
const User = require('../models/userModel')
const testHelper = require('./test_helper')

const initialBlogs = require('./test_inputs').blogs

beforeEach(async () => {
  // delete all blogs from db
  await Blog.deleteMany({})

  // initialize db with the initialBlogs array
  const blogObjects = initialBlogs
    .map(blog => new Blog(blog))
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)
})

// LOGIN WITH EXISTING USER
const login = async () => {
  const user = {
    username: 'darab',
    password: 'password'
  }

  const loginResponse = await api
    .post('/api/login')
    .send(user)
    .expect(200)
    .expect('Content-Type', /application\/json/)
  
  return loginResponse.body.token
}

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
describe('creation of a new blog', () => {
  beforeEach(async () => {
    // delete all users from db
    await User.deleteMany({})

    // create a new user instance and save it to db
    const passwordHash = await bcrypt.hash('password', 10)
    const user = new User({ username: 'darab', passwordHash })

    await user.save()
  })

  test('succeeds with a valild blog', async () => {
    const newBlog = {
      title: 'Chainsaw man',
      author: 'Tatsuki Fujimoto',
      url: 'https://chainsawman.com',
      likes: 100
    }

    const token = await login()
  
    const postResponse = await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `Bearer ${token}`)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    
    const blogsAfterPost = await testHelper.blogsInDb()
    expect(blogsAfterPost.length).toBe(initialBlogs.length + 1)
  
    const titles = blogsAfterPost.map(b => b.title)
    expect(titles).toContain(
      'Chainsaw man'
    )
  })

  test(`succeeds with the value of the likes property defaulting to 0 if it's missing`, async () => {
    const newBlog = {
      title: 'Chainsaw man',
      author: 'Tatsuki Fujimoto',
      url: 'https://chainsawman.com'
    }

    const token = await login()
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `Bearer ${token}`)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  
    const blogsAfterPost = await testHelper.blogsInDb()
    
    expect(blogsAfterPost[blogsAfterPost.length - 1].likes).toBe(0)
  })

  test('fails with 400 Bad request if the title property is missing', async () => {
    const newBlog = {
      author: 'Tatsuki Fujimoto',
      url: 'https://chainsawman.com'
    }

    const token = await login()
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `Bearer ${token}`)
      .expect(400)
  
    const blogsAfterPost = await testHelper.blogsInDb()
    expect(blogsAfterPost.length).toBe(initialBlogs.length)
  })

  test('fails with 400 Bad request if the url property is missing', async () => {
    const newBlog = {
      title: 'Chainsaw man',
      author: 'Tatsuki Fujimoto',
    }

    const token = await login()
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `Bearer ${token}`)
      .expect(400)
  
    const blogsAfterPost = await testHelper.blogsInDb()
    expect(blogsAfterPost.length).toBe(initialBlogs.length)
  })

  test('fails with 401 Unauthorize if the token is not provided', async () => {
    const newBlog = {
      title: 'Chainsaw man',
      author: 'Tatsuki Fujimoto',
      url: 'https://chainsawman.com',
      likes: 100
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', '')
      .expect(401)
      .expect('Content-Type', /application\/json/)
    
    const blogsAfterPost = await testHelper.blogsInDb()
    expect(blogsAfterPost.length).toBe(initialBlogs.length)

  })

})

// TESTING THE UPDATE OF A NOTE
describe('updating a blog', () => {
  test('succeeds with a valid id', async () => {
    const blogs = await testHelper.blogsInDb()
    const blogToUpdate = blogs[0]

    const blogObj = {
      title: 'Title of updated blog',
      author: 'Me',
      url: 'updatedBlog.com'
    }

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(blogObj)
      .expect(200)
      .expect('Content-Type', /application\/json/)
    
    const blogsAfterPut = await testHelper.blogsInDb()
    expect(blogsAfterPut[0].title).toBe('Title of updated blog')
  })
})

// TESTING DELETION OF A BLOG
describe('deletion of a blog', () => {
  test('succeeds with a valid id', async () => {
    // delete all users from db
    await User.deleteMany({})

    // create a new user instance and save it to db
    const passwordHash = await bcrypt.hash('password', 10)
    const user = new User({ username: 'darab', passwordHash })

    const newUser = await user.save()

    const newBlog = new Blog({
      title: 'new blog',
      author: 'someone',
      url: 'newblog.com',
      likes: 40,
      user: newUser.id
    })

    const savedBlog = await newBlog.save()

    const blogsAtStart = await Blog.find({})

    const token = await login()

    await api
      .delete(`/api/blogs/${savedBlog.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)
    
    const blogsAtEnd = await Blog.find({})
    expect(blogsAtEnd).toHaveLength(blogsAtStart.length - 1)

    const titles = blogsAtEnd.map(blog => blog.title)
    expect(titles).not.toContain(savedBlog.title)
  })
})

// USER TESTING
describe('creation of new users is invalid if', () => {
  beforeEach(async () => {
    // delete all users from db
    await User.deleteMany({})

    // create a new user instance and save it to db
    const passwordHash = await bcrypt.hash('password', 10)
    const user = new User({ username: 'darab', passwordHash })

    await user.save()
  })

  test(`username isn't given`, async () => {
    const usersAtStart = await testHelper.usersInDb()

    const newUser = {
      password: 'password',
      name: 'dimitris'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
    
    const usersAtEnd = await testHelper.usersInDb()
    expect(usersAtEnd).toEqual(usersAtStart)
  })

  test(`password isn't given`, async () => {
    const usersAtStart = await testHelper.usersInDb()

    const newUser = {
      username: 'darab',
      name: 'dimitris'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
    
    const usersAtEnd = await testHelper.usersInDb()
    expect(usersAtEnd).toEqual(usersAtStart)
  })

  test(`username isn't at least 3 characters long`, async () => {
    const usersAtStart = await testHelper.usersInDb()

    const newUser = {
      username: 'di',
      name: 'dimitris'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
    
    const usersAtEnd = await testHelper.usersInDb()
    expect(usersAtEnd).toEqual(usersAtStart)
  })

  test(`password isn't at least 3 characters long`, async () => {
    const usersAtStart = await testHelper.usersInDb()

    const newUser = {
      password: 'my',
      name: 'dimitris'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
    
    const usersAtEnd = await testHelper.usersInDb()
    expect(usersAtEnd).toEqual(usersAtStart)
  })

  test('username already exists', async () => {
    const usersAtStart = await testHelper.usersInDb()

    const newUser = {
      username: 'darab',
      password: 'mypassword',
      name: 'dimitris'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
    
    const usersAtEnd = await testHelper.usersInDb()
    expect(usersAtEnd).toEqual(usersAtStart)
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})