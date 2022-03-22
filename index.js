require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const Person = require('./models/person')

const app = express()

morgan.token('request-body', (req, res) => JSON.stringify(req.body))

app.use(express.static('build'))
app.use(express.json())
app.use(
  morgan(
    ':method :url :status :res[content-length] - :response-time ms :request-body'
  )
)

app.get('/api/persons', (request, response) =>
  Person.find({}).then(persons => response.json(persons))
)

app.get('/info', (request, response) => {
  const info = `
    <div>Phonebook has info for ${persons.length} prople</div>
    <br>
    <div>${new Date()}</div>
  `
  response.send(info)
})

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id).then(person => response.json(person))
})

app.delete('/api/persons/:id', (request, response) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'name or number is missing',
    })
  }

  Person.find({}).then(persons => {
    if (persons.map(person => person.name).includes(body.name)) {
      return response.status(400).json({
        error: 'name must be unique',
      })
    }
  })

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save().then(returnedPerson => response.json(returnedPerson))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  } 

  Person  .findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).json({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`)
})
