require('dotenv').config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const Contact = require('./models/contact')

const app = express()

morgan.token('request-body', (req, res) => JSON.stringify(req.body))

app.use(cors())
app.use(express.json())
app.use(
  morgan(
    ':method :url :status :res[content-length] - :response-time ms :request-body'
  )
)
app.use(express.static('build'))

app.get('/api/persons', (request, response) =>
  Contact.find({}).then(contacts => response.json(contacts))
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
  Contact.findById(request.params.id).then(contact => response.json(contact))
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

const generateRandomId = () => {
  const randomId = () => Math.floor(Math.random() * (100000000 - 1) + 1)
  let id = randomId()
  const ids = persons.map(person => person.id)

  while (ids.includes(id)) {
    id = randomId()
  }

  return id
}

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'name or number is missing',
    })
  }

  if (persons.map(person => person.name).includes(body.name)) {
    return response.status(400).json({
      error: 'name must be unique',
    })
  }

  const person = {
    id: generateRandomId(),
    name: body.name,
    number: body.number,
  }

  persons = persons.concat(person)

  response.json(person)
})

const unknownEndpoint = (request, response) => {
  response.status(404).json({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`)
})
