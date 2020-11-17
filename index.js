const express = require('express');
const app = express();
require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
const PORT = process.env.PORT || 7000;
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const ObjectId = require('mongodb').ObjectId;

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('service'));
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.y5kfv.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const houseCollection = client.db("apartmentHunt").collection("house");
    const rentCollection = client.db("apartmentHunt").collection("rent");

    // Add house
    app.post('/addHouse', (req, res) => {
        const file = req.files.file;
        const title = req.body.title;
        const price = req.body.price;
        const location = req.body.location;
        const bedroom = req.body.bedroom;
        const bathroom = req.body.bathroom;

        const newImg = file.data;
        const encImg = newImg.toString('base64');

        // console.log(file, title, price, location, bedroom, bathroom);
        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        houseCollection.insertOne({ title, price, location, bedroom, bathroom, image })
            .then(result => {
                res.send(result.insertedCount > 0)
            })

    });

    // House List
    app.get('/house', (req, res) => {
        houseCollection.find({})
            .toArray((error, document) => {
                res.send(document);
            })
    });

    // Get selected apt data
    app.get('/apartmentDetails/:id', (req, res) => {
    houseCollection.find({
      _id: ObjectId(req.params.id)
    })
    .toArray((err, documents) => {
        res.send(documents[0])
        })
    })
    
    // Request Apartment Booking
    app.post('/requestBooking', (req, res) => {
        const receivedData = req.body;
        console.log(receivedData);
    })

});


app.get('/', (req, res) => {
    res.send('Welcome to Apertment Hunt Server');
})

app.listen(PORT)