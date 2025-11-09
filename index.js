const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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

async function run() {
    await client.connect()

    const db = client.db('homenest_db');
    const homeCollection = db.collection('homes')
// All data
    app.get("/homes",async(req,res)=>{
        const cursor = homeCollection.find().sort({price:-1});
        const result = await cursor.toArray();
        res.send(result)
    })
    // recent-homes-data
    app.get("/recent-homes",async(req,res)=>{
        const cursor = homeCollection.find().sort({price:-1}).limit(6);
        const result = await cursor.toArray();
        res.send(result)
    })
    // Single Data
    app.get("/homes/:id",async(req,res)=>{
        const id = req.params.id;
        const query ={_id: new ObjectId(id)};
        const result = await homeCollection.findOne(query);
        res.send(result)
    })

    app.post("/homes", async(req,res)=>{
        const newHome = req.body;
        const result = await homeCollection.insertOne(newHome);
        res.send(result);
    })
    // update Homes
    app.patch("/homes/:id", async(req,res)=>{
        const id = req.params.id;
        const updateHome = req.body;
        const query = {_id: new ObjectId(id)};
        const update ={
            $set: updateHome
        }
        const result = await homeCollection.updateOne(query,update);
        res.send(result)
    })
    // Delete Homes
    app.delete("/homes/:id", async(req,res)=>{
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await homeCollection.deleteOne(query);
        res.send(result)
    })

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
}
run().catch(console.dir)

app.listen(port, () => {
    console.log(`HomeNest Is Running On ${port}`)
})
