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

//--------------------------------------------------------------------------------------------------
//MIDDLEWARE
//--------------------------------------------------------------------------------------------------
app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())



//--------------------------------------------------------------------------------------------------
//ENDPOINTS
//--------------------------------------------------------------------------------------------------
//base url
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


//get all users
app.get("/api/users", (req, res) => {
  User.find({}, (err, data) => {
    if(!data){
      res.send("No users")
    }else{
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

app.get("/api/users/:id/logs", (req, res) => {
  const { from, to, limit } = req.query;
  const {id} = req.params;
  User.findById(id, (err, userData) => {
    if(err || !userData) {
      res.send("Could not find user");
    }else{
      let dateObj = {}
      if(from){
        dateObj["$gte"] = new Date(from)
      }
      if(to){
        dateObj["$lte"] = new Date(to)
      }
      let filter = {
        userId: id
      }
      if(from || to ){
        filter.date = dateObj
      }
      let nonNullLimit = limit ?? 500
      Exercise.find(filter).limit(+nonNullLimit).exec((err, data) => {
        if(err || !data){
          res.json([])
        }else{
          const count = data.length
          const rawLog = data
          const {username, _id} = userData;
          const log= rawLog.map((l) => ({
            description: l.description,
            duration: l.duration,
            date: l.date.toDateString()
          }))
          res.json({username, count, _id, log})
        }
      })
    } 
  })
})




//--------------------------------------------------------------------------------------------------
//PORT
//--------------------------------------------------------------------------------------------------
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
