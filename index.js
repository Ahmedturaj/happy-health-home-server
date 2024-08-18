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
// middleWare end
// MongoDB
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nzlapl6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

    app.get("/medicine", async (req, res) => {
      const result = await medicineCollections.find().toArray();
      res.send(result);
    });

    app.get("/medicines", async (req, res) => {
      const {
        page = 1,
        limit = 10,
        sortBy = "price",
        sortOrder = "asc",
        search = "",
      } = req.query;

      try {
        const query = {
          medicineName: { $regex: search, $options: "i" },
        };

        const medicines = await medicineCollections
          .find(query)
          .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
          .skip((page - 1) * limit)
          .limit(parseInt(limit))
          .toArray();

        const total = await medicineCollections.countDocuments(query);

        res.json({
          medicines,
          totalPages: Math.ceil(total / limit),
          currentPage: parseInt(page),
        });
      } catch (error) {
        res.status(500).json({ error: "Something went wrong" });
      }
    });

    app.get("/doctors", async (req, res) => {
      const result = await doctorsCollections.find().toArray();
      res.send(result);
    });

    console.log("Connected to MongoDB!");
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("This is Job Task from SCIC");
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
