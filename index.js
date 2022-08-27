//IMPORTS
const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const mongoose = require("mongoose")
require('dotenv').config()

//MONGO_DB & MONGOOSE
mongoose.connect(process.env.MONGO_URI, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
})
const { Schema } = mongoose
const ExerciseSchema = new Schema({
  userId: { type: String, required: true}, //USERNAME?
  description: String,
  duration: Number,
  date: Date
})
const UserSchema = new Schema({
  username: String
})
const User = mongoose.model("User", UserSchema)
const Exercise = mongoose.model("Exercise", ExerciseSchema)


//MIDDLEWARE

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

//ENDPOINTS
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
})

//post an user
app.post('/api/users', (req, res) => {
  console.log('req.body', req.body)
  const newUser = new User(
    {
      username: req.body.username
    }
  )
  newUser.save((err,data) => {
    if(err || !data){
      res.send("there was an error saving the user")
    }
    else{
      res.json(data)
    }
  })
})

//post an exercise
app.post('/api/users/:id/exercises', (req, res) => {
  console.log('req.body', req.body)
  console.log('req.params', req.params)
  const id = req.params.id
  const {description, duration, date} = req.body
  console.log('description:', description)
  console.log('duration:', duration)
  console.log('date:', date)
  User.findById(id, (err, userData) => {
    if(err || !userData){
      res.send("Could not find user")
    }
    else{
      const newExercise = new Exercise({
          userId: id, 
          description: description,
          duration: duration,
          date: new Date(date)
        })
      newExercise.save((err,data) => {
        if(err || !data){
          res.send("there was an error saving the exercise")
        }
        else{
          res.json({
            username: userData.username,
            description: description,
            duration: duration,
            date: newExercise.date.toDateString(),
            _id: userData.id
          })
        }
      })
    }
  })
})





//PORT
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
