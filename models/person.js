const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

console.log('connecting to ', url)

mongoose
  .connect(url)
  .then(result => console.log('connected to MongoDB'))
  .catch(error => console.log('error connecting to MongoDB:', error.message))

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'name is required'],
    minLength: [3, 'name should be at least 3 characters long'],
    unique: true,
  },
  number: {
    type: String,
    required: [true, 'number is required'],
    minLength: [8, 'number should be at least 8 characters long'],
    validate: {
      validator(v) {
        if (v.split('-').length > 2) return false
        return /\d{2,3}-\d/.test(v)
      },
      message: props => `${props.value} is not a valid phone number!`,
    },
  },
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

module.exports = mongoose.model('Person', personSchema)
