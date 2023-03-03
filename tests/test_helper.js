const Blog = require('../models/blogModel')
const User = require('../models/userModel')

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

module.exports = {
  blogsInDb,
  usersInDb
}

