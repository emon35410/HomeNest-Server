const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors')
const { v4: uuidv4 } = require('uuid'); 
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
    const propertyCollection = db.collection('property')

    // MyProperty Data
    app.post("/myproperties", async (req, res) => {
        const myProperty = req.body;
        const result = await propertyCollection.insertOne(myProperty);
        res.send(result);
    });
    app.get("/myproperties", async (req, res) => {
        const email = req.query.email;
        const query = email ? { buyer_email: email } : {};
        const result = await propertyCollection.find(query).toArray();
        res.send(result);
    });
    app.get("/myproperties", async (req, res) => {
        const email = req.query.email;
        if (!email) {
            return res.status(400).send({ message: "Email is required" });
        }

        const result = await propertyCollection.find({ buyer_email: email }).toArray();
        res.send(result);
    });
    app.get("/myproperties/:id", async (req, res) => {
        const id = req.params.id;

        if (!ObjectId.isValid(id)) {
            return res.status(400).send({ message: "Invalid property ID" });
        }

        const property = await propertyCollection.findOne({ _id: new ObjectId(id) });

        if (!property) {
            return res.status(404).send({ message: "Property not found" });
        }

        res.send(property);
    });
    app.delete("/myproperties/:id", async (req, res) => {
        const id = req.params.id;
        const result = await propertyCollection.deleteOne({ _id: new ObjectId(id) });
        res.send(result);
    });

    app.put("/myproperties/:id", async (req, res) => {
        const id = req.params.id;
        const updatedData = req.body;
        const result = await propertyCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updatedData }
        );
        res.send(result);
    });

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
        newHome._id = uuidv4();
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