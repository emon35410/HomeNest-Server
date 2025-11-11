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
app.use(cors());
app.use(express.json())
app.get('/', (req, res) => {
    res.send('HomeNest Is Running!')
})

async function run() {
    await client.connect()

    const db = client.db('homenest_db');
    const homeCollection = db.collection('homes')
    const userCollection = db.collection('users')

    // Users data
    app.post("/users", async (req, res) => {
        const newUser = req.body;
        const email = newUser.email;
        const query = { email: email };
        const existingUser = await userCollection.findOne(query);

        if (existingUser) {
            return res.json({ success: false, message: "Already Have an Account" });
        } else {
            const result = await userCollection.insertOne(newUser);
            return res.json({ success: true, message: "User saved", data: result });
        }
    });


    app.get("/users", async (req, res) => {
        const users = await userCollection.find().toArray();
        res.send(users);
    });

    // All data
    app.get("/homes", async (req, res) => {
        // find home by email
        const email = req.query.email;
        const query = {};
        if (email) {
            query.seller_email = email;
        }

        console.log("Query received:", query);

        const cursor = homeCollection.find(query).sort({ price: -1 });
        const result = await cursor.toArray();
        res.send(result)
    })


    // recent-homes-data
    app.get("/recent-homes", async (req, res) => {
        const cursor = homeCollection.find().sort({ price: -1 }).limit(6);
        const result = await cursor.toArray();
        res.send(result)
    })
    // Single Data
    app.get("/homes/:id", async (req, res) => {
        try {
            const id = req.params.id;
            const query = { _id: id };
            const result = await homeCollection.findOne(query);
            if (!result) return res.status(404).send({ message: "Home not found" });
            res.send(result);
        } catch (error) {
            console.error("Error fetching home:", error);
            res.status(500).send({ error: "Invalid ID or server error" });
        }
    });


    app.post("/homes", async (req, res) => {
        const newHome = req.body;
        const result = await homeCollection.insertOne(newHome);
        res.send(result);
    })
    // update Homes
    app.patch("/homes/:id", async (req, res) => {
        const id = req.params.id;
        const updateHome = req.body;
        const query = { _id: new ObjectId(id) };
        const update = {
            $set: updateHome
        }
        const result = await homeCollection.updateOne(query, update);
        res.send(result)
    })
    // Delete Homes
    app.delete("/homes/:id", async (req, res) => {
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