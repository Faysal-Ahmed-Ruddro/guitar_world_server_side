const express = require("express");
const cors = require("cors");
require("dotenv").config();
const ObjectId = require("mongodb").ObjectId;
const { MongoClient } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// database connect
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qrkkr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("guitars_world");
    const guitarCollection = database.collection("guitars");
    const ordersCollection = database.collection("orders");
    const usersCollection = database.collection("users");
    console.log("database connected successfully");

    // GUITARS GET API
    app.get("/guitars", async (req, res) => {
      const cursor = guitarCollection.find({});
      const guitars = await cursor.toArray();
      res.json(guitars);
    });
    // SINGLE GUITARS  API
    app.get("/guitars/:id", async (req, res) => {
      console.log(req.params.id);
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const guitars = await guitarCollection.findOne(query);
      res.json(guitars);
      console.log(guitars);
    });
    app.delete("/guitars/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await guitarCollection.deleteOne(query);
      res.json(result);
    });

    // Orders GET API
    app.get("/orders", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      console.log(query);
      const cursor = ordersCollection.find(query);
      const orders = await cursor.toArray();
      res.json(orders);
    });
    //  Orders POST API
    app.post("/orders", async (req, res) => {
      const orders = req.body;
      const result = await ordersCollection.insertOne(orders);
      console.log(result);
      res.json(result);
    });

    // ADD GUITAR POST API
    app.post("/guitars", async (req, res) => {
      const guitars = req.body;
      console.log("hit the post api", guitars);
      const result = await guitarCollection.insertOne(guitars);
      console.log(result);
      res.json(result);
    });

    // USER POST API
    app.post("/users", async (req, res) => {
      const user = req.body;
      console.log(req.body);
      const result = await usersCollection.insertOne(user);

      res.json(result);
    });
    //   update user
    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    //  makeing Admin
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user?.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

// created the server
app.get("/", (req, res) => {
  res.send("WellCome To Guitar World Server");
});
app.listen(port, () => {
  console.log("Server Running on port", port);
});
