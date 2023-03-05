const bcrypt = require('bcrypt')
const userRouter = require('express').Router()
const User = require('../models/userModel')

// GET ALL USERS
userRouter.get('/', async (req, res) => {
  const users = await User
    .find({})
    .populate('blogs', { url: 1, title: 1, author: 1 })
  
  res.status(200).json(users)
})

// CREATE NEW USER
userRouter.post('/', async (req, res) => {
  const { username, password, name } = req.body

  if (!username || !password) {
    return res.status(400).json({
      error: 'username and password must be provided!'
    })
  }

  if (username.length < 3 || password.length < 3) {
    return res.status(400).json({
      error: 'username and password must be at least 3 characters long!'
    })
  }

  const userInDb = await User.findOne({ username })
  console.log('userIndb: ', userInDb)

  if (userInDb) {
    return res.status(400).json({
      error: `User with username ${userInDb.username} already exists! Please try with a different username`
    })
  }

  const salt = 10
  const passwordHash = await bcrypt.hash(password, salt)

  const user = new User({
    username,
    name,
    passwordHash
  })

  const savedUser = await user.save()
  res.status(201).json(savedUser)

})

module.exports = userRouter