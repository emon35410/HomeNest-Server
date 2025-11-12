const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@learndb.jowukka.mongodb.net/?appName=LearnDB`;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
    res.send('HomeNest Is Running!');
});

async function run() {
    await client.connect();
    const db = client.db('homenest_db');

    const homeCollection = db.collection('homes');
    const userCollection = db.collection('users');
    const propertyCollection = db.collection('property');
    const reviewsCollection = db.collection('reviews');

    // ---------------- Reviews ----------------
    app.post("/reviews", async (req, res) => {
        const review = req.body;
        const result = await reviewsCollection.insertOne(review);
        res.send(result);
    });


    app.get("/reviews", async (req, res) => {
        const reviewer_email = req.query.reviewer_email;
        const query = reviewer_email ? { reviewer_email } : {};
        const result = await reviewsCollection.find(query).sort({ date: -1 }).toArray();
        res.send(result);
    });
    app.get("/reviews/property/:property_id", async (req, res) => {
        const property_id = req.params.property_id;
        const result = await reviewsCollection.find({ property_id }).sort({ date: -1 }).toArray();
        res.send(result);
    });

    // ---------------- My Properties ----------------
    app.post("/myproperties", async (req, res) => {
        const myProperty = req.body;
        const result = await propertyCollection.insertOne(myProperty);
        res.send(result);
    });


    app.get("/myproperties", async (req, res) => {
        const email = req.query.email;
        const query = email ? { buyer_email: email } : {};
        const properties = await propertyCollection.find(query).toArray();
        res.send(properties);
    });


    app.get("/myproperties/:id", async (req, res) => {
        const id = req.params.id;
        if (!ObjectId.isValid(id)) return res.status(400).send({ message: "Invalid property ID" });

        const property = await propertyCollection.findOne({ _id: new ObjectId(id) });
        if (!property) return res.status(404).send({ message: "Property not found" });

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

    // ---------------- Users ----------------
    app.post("/users", async (req, res) => {
        const newUser = req.body;
        const existingUser = await userCollection.findOne({ email: newUser.email });
        if (existingUser) return res.json({ success: false, message: "Already Have an Account" });

        const result = await userCollection.insertOne(newUser);
        res.json({ success: true, message: "User saved", data: result });
    });

    app.get("/users", async (req, res) => {
        const users = await userCollection.find().toArray();
        res.send(users);
    });

    // ---------------- Homes ----------------
    app.get("/homes", async (req, res) => {
        const email = req.query.email; // optional filter by seller email
        const query = email ? { seller_email: email } : {};
        const homes = await homeCollection.find(query).sort({ price: -1 }).toArray();
        res.send(homes);
    });


    app.get("/recent-homes", async (req, res) => {
        const homes = await homeCollection.find().sort({ price: -1 }).limit(6).toArray();
        res.send(homes);
    });


    app.get("/homes/:id", async (req, res) => {
        const id = req.params.id;
        const home = await homeCollection.findOne({ _id: id });
        if (!home) return res.status(404).send({ message: "Home not found" });
        res.send(home);
    });


    app.post("/homes", async (req, res) => {
        const newHome = req.body;
        newHome._id = uuidv4();
        const result = await homeCollection.insertOne(newHome);
        res.send(result);
    });


    app.patch("/homes/:id", async (req, res) => {
        const id = req.params.id;
        const updateHome = req.body;
        const result = await homeCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateHome }
        );
        res.send(result);
    });


    app.delete("/homes/:id", async (req, res) => {
        const id = req.params.id;
        const result = await homeCollection.deleteOne({ _id: new ObjectId(id) });
        res.send(result);
    });

    console.log("MongoDB connected successfully!");
}

run().catch(console.dir);

app.listen(port, () => {
    console.log(`HomeNest Is Running On ${port}`);
});
