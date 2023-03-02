const bcrypt = require('bcrypt')
const userRouter = require('express').Router()
const User = require('../models/userModel')

// GET ALL USERS
userRouter.get('/', async (req, res) => {
  const users = await User.find({})
  res.status(200).json(users)
})

// CREATE NEW USER
userRouter.post('/', async (req, res) => {
  const { username, password, name } = req.body

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