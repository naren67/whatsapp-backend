//importing
import express from 'express'
import mongoose from 'mongoose'
import Messages from './dbMessages.js'
import Pusher from 'pusher'
import cors from 'cors'


//app config
const app = express()
const port = process.env.PORT || 4000


//middleware
app.use(express.json())

// app.use((req, res, next) => {
//           res.setHeader('Access-Control-Allow-Origin','*');
//           res.setHeader('Access-Control-Allow-Headers','*');
//           next()
// })
app.use(cors())


//db config  //password RNkuFMfkHZ9xMMR
const connection_Url = 'mongodb+srv://admin:RNkuFMfkHZ9xMMR@cluster0.xejjo.mongodb.net/whatsappDB?retryWrites=true&w=majority'


//make connection smoother
mongoose.connect(connection_Url,{
          useNewUrlParser: true,
          useUnifiedTopology: true,
          useCreateIndex: true
})

//create a change stream to watch the mongoose db
const db = mongoose.connection

db.once('open',()=>{
          console.log('mongoose connection is live')

          //change stream to watch the db changes 
const messagesInDb = db.collection('messagecontents')

const changeStream = messagesInDb.watch()


changeStream.on('change',(change)=>{
          // console.log('changes took place',change.fullDocument)
          console.log('changes took place',change)

          if(change.operationType === 'insert'){
                    const messageInformations =  change.fullDocument;

                    pusher.trigger('messages','inserted',{
                            name:messageInformations.name,
                            message:messageInformations.message,
                            timestamp:messageInformations.timestamp,
                            receiver:messageInformations.receiver
                    })
          }
          else{
                    console.log('error occured while triggering messages to pusher.com')
          }
})
})





//push method
const pusher = new Pusher({
          appId: "1188094",
          key: "36eabe34aa32764b7d33",
          secret: "0ecca47e154c18d5105a",
          cluster: "ap2",
          useTLS: true
        });



//api routes
app.get('/',(req,res)=>{
          res.status(200).send('hello there')
})


app.post('/message/new',(req,res)=>{
          const dbMessageBody = req.body

          Messages.create(dbMessageBody,(err,data)=>{
                    if(err){
                              res.status(500).send(err)
                    }
                    else{
                              res.status(201).send(data)
                    }
          })
})


app.get('/message/sync',(req,res)=>{

          Messages.find((err,data)=>{
                    if(err){
                              res.status(500).send(err)
                    }
                    else{
                              res.status(200).send(data)
                    }
          })
})

//listen
app.listen(port,()=>{
          console.log('express started')
})
