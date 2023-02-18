const listHelper = require('../utils/list_helper')
const testInputs = require('./test_inputs')

// TOTAL LIKES TEST
describe('total likes', () => {
  const listWithOneBlog = [
    {
      _id: '5a422aa71b54a676234d17f8',
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
      likes: 5,
      __v: 0
    }
  ]

  test('of empty list is zero', () => {
    const blog = []

    const result = listHelper.totalLikes(blog)

    expect(result).toBe(0)
  })

  test('when list has only one blog equals the likes of that', () => {
    const result = listHelper.totalLikes(listWithOneBlog)

    expect(result).toBe(5)
  })

  test('of a bigger list is calculated right', () => {
    const result = listHelper.totalLikes(testInputs.blogs)

    expect(result).toBe(36)
  })
})

describe('favorite blog', () => {
  const blogWithMostLikes = {
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    likes: 12
  }

  test('is the one with the most likes', () => {
    const result = listHelper.favoriteBlog(testInputs.blogs)
    
    expect(result).toEqual(blogWithMostLikes)
  })
})