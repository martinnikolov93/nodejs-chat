require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser')
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const mongoose = require('mongoose');

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))

const Message = mongoose.model('Message', {
    name: String,
    message: String
})

const dbuser = 'user'
const dbpass = process.env.DB_PASSWORD
const dbname = 'nodejschat'
const dbUrl = `mongodb+srv://${dbuser}:${dbpass}@softuni-bhvuj.mongodb.net/${dbname}?retryWrites=true&w=majority`

app.get('/messages', (req, res) => {
    Message.find({}, (err, messages) => {
        res.send(messages);
    })
})

app.post('/messages', (req, res) => {
    const message = new Message(req.body);
    message.save((err) => {
        if (err)
            sendStatus(500);
        io.emit('message', req.body);
        res.sendStatus(200);
    })
})

io.on('connection', () => {
    console.log('a user is connected')
})

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}, (err) => {
    if (err) {
        console.error(err)
        throw err
    }

    console.log('Database is setup and running')
})

const server = http.listen(3000, () => {
    console.log('Server is running on port', server.address().port);
});