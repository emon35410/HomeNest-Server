const express = require('express')
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors')
const app = express()
require('dotenv').config()
const port = process.env.PORT || 3000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@learndb.jowukka.mongodb.net/?appName=LearnDB`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
app.use(cors())
app.use(express.json())
app.get('/', (req, res) => {
    res.send('HomeNest Is Running!')
})

async function run (){

}
run().catch(console.dir)

app.listen(port, () => {
    console.log(`HomeNest Is Running On ${port}`)
})
