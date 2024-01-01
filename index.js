require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174']
}));
app.use(express.json());

const port = 5000;

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const uri = `${process.env.MONGO_URI}`;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();
        const noteCollection = client.db("NoteApi").collection("notes");

        // ADD NEW NOTES TO NOTES COLLECTION
        app.post("/createNotes", async (req, res) => {
            try {
                const notes = req.body;
                const result = await noteCollection.insertOne(notes);
                res.send(result);
            } catch (error) {
                console.error(error);
                res.status(500).send('Internal Server Error');
            }
        });

        // GET NOTES BY SPECIFIC USER
        app.get("/getNotes/:email", async (req, res) => {
            try {
                const email = req.params.email;
                const query = { email: email };
                const result = await noteCollection.find(query).toArray();
                res.send(result);
            } catch (error) {
                console.error(error);
                res.status(500).send('Internal Server Error');
            }
        });

        // DELETE NOTES
        app.delete("/deleteNotes/:id", async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) };
                const result = await noteCollection.deleteOne(query);
                res.send(result);
            } catch (error) {
                console.error(error);
                res.status(500).send('Internal Server Error');
            }
        });

        // GET SINGLE NOTE BY ID
        app.get("/getNotesByID/:id", async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) };
                const result = await noteCollection.findOne(query);
                res.send(result);
            } catch (error) {
                console.error(error);
                res.status(500).send('Internal Server Error');
            }
        });

        // UPDATE SINGLE NOTE DATA
        app.put("/updateNote/:id", async (req, res) => {
            try {
                const id = req.params.id;
                const noteData = req.body;
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
            } catch (error) {
                console.error(error);
                res.status(500).send('Internal Server Error');
            }
        });

        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Uncommented the following line to close the client when done
        // await client.close();
    }
}

app.get('/', (req, res) => {
    res.send('Notes Server!');
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

run().catch(console.dir);
