const express = require('express');
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000
const app = express()

// middleware 
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wnw5g.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const coffeeCollection = client.db('coffeeDB').collection('coffee')

    const userCollection = client.db('coffeeDB').collection('users')
    
    //get coffee
    app.get('/coffee', async(req, res) => {
      const cursor = coffeeCollection.find()
      const result = await cursor.toArray()
      res.send(result)
    })

  
    app.get('/coffee/:id', async(req, res) => {
      const id = req.params.id
      const query = {_id: new ObjectId(id)}
      const result = await coffeeCollection.findOne(query)
      res.send(result)
    })
    
    //create coffee
    app.post('/coffee', async(req,res) =>{
      const newCoffee = req.body
      console.log(newCoffee)
      const result = await coffeeCollection.insertOne(newCoffee)
      res.send(result)
    })
    
    // coffee update 
    app.put('/coffee/:id', async(req, res)=> {
      const id = req.params.id 
      const filter = {_id: new ObjectId(id)}
      const options = {upsert: true}
      const updatedCoffee = req.body
      const coffee = {
        $set: {
          name:updatedCoffee.name,
          quantity:updatedCoffee.quantity,
          supplier:updatedCoffee.supplier,
          taste:updatedCoffee.taste,
          category:updatedCoffee.category,
          details:updatedCoffee.details,
          photo:updatedCoffee.photo,
        }
      }
      const result = await coffeeCollection.updateOne(filter, coffee, options)
      res.send(result)
    })
    
    // delete coffee 
    app.delete('/coffee/:id', async(req, res) =>{
      const id = req.params.id
      const query = {_id: new ObjectId(id)}
      const result = await coffeeCollection.deleteOne(query)
      res.send(result)
    })

    // users related apis from here======================
    app.get('/users', async(req, res)=> {
      const cursor = userCollection.find() 
      const result = await cursor.toArray()
      res.send(result)
    })

    // crete user 
    app.post('/users', async(req, res) => {
      const newUsers = req.body
      console.log('creating new users', newUsers)
      const result = await userCollection.insertOne(newUsers)
      res.send(result)
    })
    
    // update email at the time of login 
    app.patch('/users', async(req, res) => {
      const email = req.body.email
      const filter = {email }
      const updatedDoc = {
        $set: {
          lastSignInTime: req.body?.lastSignInTime
        }
      }
      const result = await userCollection.updateOne(filter, updatedDoc)
      res.send(result)
    })

    // delete 
    app.delete('/users/:id', async(req, res)=> {
      const id = req.params.id
      const query = {_id: new ObjectId(id)}
      const result = await userCollection.deleteOne(query)
      res.send(result)
    })
    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Coffee store server is running')
})

app.listen(port, ()=>{
    console.log(`Coffee store server is running on port ${port}` )
})