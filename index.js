require('dotenv').config()
const express = require('express')
let cors = require("cors");
const app = express()

app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174']
}));
app.use(express.json());

const port = 5000


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


//  ****
// PLEASE CREATE A DOT ENV FILE AND INSERT YOUR OWN MONGO DB URI IN DOT ENV 
const uri = `${process.env.MONGO_URI}`;
// *****


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
        // await client.connect();
        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        const noteCollection = client.db("NoteApi").collection("notes");

        //ADD NEW NOTES TO NOTES COLLECTION

        app.post("/createNotes", async (req, res) => {
            const notes = req.body;
            const result = await noteCollection.insertOne(notes);
            res.send(result);
        });

        // GET NOTES BY SPECIFIC USER 
        app.get("/getNotes/:email", async (req, res) => {
            const email = req.params.email;
            const query = {
                email: email
            };
            const result = await noteCollection.find(query).toArray();
            res.send(result);
        });

        // DELETE NOTES  
        app.delete("/deleteNotes/:id", async (req, res) => {
            const id = req.params.id;
            const query = {
                _id: new ObjectId(id),
            };
            const result = await noteCollection.deleteOne(query);
            res.send(result);
        });

        //   GET SINGLE NOTE BY ID 
        app.get("/getNotesByID/:id", async (req, res) => {
            const id = req.params.id;
            const query = {
                _id: new ObjectId(id),
            };
            const result = await noteCollection.findOne(query);
            res.send(result);
        });

        // UPDATE SINGLE NOTE DATA 
        app.put("/updateNote/:id", async (req, res) => {
            const id = req.params.id;
            const noteData = req.body;
            console.log(id);
            console.log(noteData);
            const currentTime = new Date();
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedData = {
                $set: {
                    title: noteData.title,
                    content: noteData.content,
                    updateTime: currentTime
                },
            };
            const result = await noteCollection.updateOne(
                filter,
                updatedData,
                options
            );
            res.send(result);
        });


        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Notes Server!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})