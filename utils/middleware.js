const logger = require('./logger')
const jwt = require('jsonwebtoken')

// LOGGER MIDDLEWARE
const requestLogger = (req, res, next) => {
  logger.info('Method: ', req.method)
  logger.info('Path: ', req.path)
  logger.info('Body: ', req.body)
  logger.info('-------------------')

  next()
}

// UNKNOWN ENDPOINT MIDDLEWARE
const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'Unknown endpoint' })
}

// TOKEN EXTRACTOR MIDDLEWARE
const tokenExtractor = (req, res, next) => {
  const authorization = req.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    req.token = authorization.split(' ')[1]
  }

  next()
}

// USER EXTRACTOR MIDDLEWARE
const userExtractor = async (req, res, next) => {
  if (req.token) {
    console.log('req.token: ', req.token)
    const decodedToken = await jwt.verify(req.token, process.env.SECRET)
    console.log('decodedToken.id', decodedToken.id)
    req.user = decodedToken.id
    return next()
  } 

  next()
}

// ERROR HANDLING MIDDLEWARES
const errorHandler = (err, req, res, next) => {
  logger.error(err.message)

  if (err.name === 'CastError') {
    return request.status(400).send({ error: 'malformatted id' })
  } else if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message })
  } else if (err.name === 'JsonWebTokenError') {
    return res.status(400).json({ error: err.message })
  }

  next(err)
}

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor
}