const express = require("express");
const app = express();

const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const port = process.env.PORT || 5000;

// middleware
app.use(express.json());
app.use(cors());

// const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.ufgx0zu.mongodb.net/?retryWrites=true&w=majority`;
const uri = `mongodb://${process.env.DB_NAME}:${process.env.DB_PASS}@ac-scj1kyz-shard-00-00.ufgx0zu.mongodb.net:27017,ac-scj1kyz-shard-00-01.ufgx0zu.mongodb.net:27017,ac-scj1kyz-shard-00-02.ufgx0zu.mongodb.net:27017/?ssl=true&replicaSet=atlas-ts3tkk-shard-0&authSource=admin&retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // collections
    const allServicesCollection = client
      .db("eduEventDB")
      .collection("all-services");
    const usersCollections = client.db("eduEventDB").collection("user");

    //   get all services
    app.get("/services", async (req, res) => {
      const category = req.query.category;
      console.log(category);

      const page = Number(req.query.page);
      const limit = Number(req.query.limit);
      const skip = (page - 1) * limit;

      let query = {};
      if (category) {
        query.category = category;
      }

      const result = await allServicesCollection
        .find(query)
        .skip(skip)
        .limit(limit)
        .toArray();
      const totalServices = await allServicesCollection.countDocuments(query);
      res.send({ result, totalServices });
    });
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allServicesCollection.findOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Edu-Event's Server is running");
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
