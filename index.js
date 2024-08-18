const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();

// Middleware
const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());

// MongoDB connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nzlapl6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    const medicineCollections = client
      .db("happyHealthHome")
      .collection("medicine");
    const doctorsCollections = client
      .db("happyHealthHome")
      .collection("doctors");

    // Basic get route for all medicines
    app.get("/medicine", async (req, res) => {
      const result = await medicineCollections.find().toArray();
      res.send(result);
    });

    // Route with pagination, sorting, and searching
    app.get("/medicines", async (req, res) => {
      const {
        page = 1,
        limit = 10,
        sortBy = "price",
        sortOrder = "asc",
        search = "",
      } = req.query;

      try {
        // Build the search query
        const query = {
          medicineName: { $regex: search, $options: "i" }, // Case-insensitive search
        };

        // Fetch the medicines from the database with sorting and pagination
        const medicines = await medicineCollections
          .find(query)
          .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
          .skip((page - 1) * limit)
          .limit(parseInt(limit))
          .toArray();

        // Get the total count of matching documents
        const total = await medicineCollections.countDocuments(query);

        // Send the response with medicines and pagination info
        res.json({
          medicines,
          totalPages: Math.ceil(total / limit),
          currentPage: parseInt(page),
        });
      } catch (error) {
        res.status(500).json({ error: "Something went wrong" });
      }
    });

    // doctors

    app.get("/doctors", async (req, res) => {
      const result= await ;
    });

    console.log("Connected to MongoDB!");
  } finally {
    // You can close the client connection if needed
    // await client.close();
  }
}
run().catch(console.dir);

// Basic route to check server status
app.get("/", (req, res) => {
  res.send("This is Job Task from SCIC");
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
