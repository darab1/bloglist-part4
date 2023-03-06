const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/userModel')

loginRouter.post('/', async (req, res) => {
  const { username, password } = req.body

  const user = await User.findOne({ username })
  console.log('user: ', user)

  const passwordCorrect = user === null 
    ? false
    : await bcrypt.compare(password, user.passwordHash)
  console.log('passwordCorrect: ', passwordCorrect)

  if (!user ) {
    return res.status(401).json({
      error: 'Invalid username!'
    })
  }

  if (!passwordCorrect)  {
    return res.status(401).json({
      error: 'Invalid password!'
    })
  }

  const userForToken = {
    username: user.username,
    id: user._id
  }

  const token = await jwt.sign(userForToken, process.env.SECRET)

  res
    .status(200)
    .send({ token, username: user.username, name: user.name })
})

module.exports = loginRouter