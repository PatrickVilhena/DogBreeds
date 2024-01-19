const express = require("express");
const uuid = require("uuid");
const sqlite3 = require("sqlite3");
const axios = require("axios");

const db = new sqlite3.Database("dogbreeds.db");

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS dogbreeds (
            id TEXT PRIMARY KEY,
            breed TEXT, 
            size TEXT,
            origin TEXT,
            life_expectancy TEXT,
            color TEXT
        )
    `);
});

const app = express();
app.use(express.json());

// GET ALL dogbreeds
app.get("/dogbreeds", (request, response) => {
    let { limit } = request.query;
    limit = Math.min(limit || 50);

    db.all("SELECT * FROM dogbreeds LIMIT ?", [limit], (err, rows) => {
        if (err) {
            return response.status(500).json({ error: err.message });
        }

        response.json(rows);
    });
});

// GET ONE DOGBREEDS BY ID
app.get("/dogbreeds/:id", (request, response) => {
    const { id } = request.params;

    db.get("SELECT * FROM dogbreeds WHERE id = ?", [id], (err, row) => {
        if (err) {
            return response.status(500).json({ error: err.message });
        }

        if (!row) {
            return response.status(404).json({ error: "Dog breed not found" });
        }

        response.json(row);
    });
});

// CREATE A NEW DOG BREED
app.post("/dogbreeds", (request, response) => {
    const newBreed = { id: uuid.v4(), ...request.body };

    db.run(
        "INSERT INTO dogbreeds (id, breed, size, origin, life_expectancy, color) VALUES (?, ?, ?, ?, ?, ?)",
        [
            newBreed.id,
            newBreed.breed, 
            newBreed.size,
            newBreed.origin,
            newBreed.life_expectancy,
            newBreed.color,
        ],
        (err) => {
            if (err) {
                return response.status(500).json({ error: err.message });
            }

            response.status(201).json({
                message: "Dog breed added successfully",
                newBreed,
            });
        }
    );
});

// UPDATE A DOG BREED BY ID
app.put("/dogbreeds/:id", (request, response) => {
    const { id } = request.params;
    const updatedBreed = request.body;

    db.run(
        "UPDATE dogbreeds SET breed = ?, size = ?, origin = ?, life_expectancy = ?, color = ? WHERE id = ?",
        [
            updatedBreed.breed, 
            updatedBreed.size,
            updatedBreed.origin,
            updatedBreed.life_expectancy,
            updatedBreed.color,
            id,
        ],
        (err) => {
            if (err) {
                return response.status(500).json({ error: err.message });
            }

            response.json({
                message: "Dog breed updated successfully",
                updatedBreed,
            });
        }
    );
});

// DELETE A DOG BREED BY ID
app.delete("/dogbreeds/:id", (request, response) => {
    const { id } = request.params;

    db.run("DELETE FROM dogbreeds WHERE id = ?", [id], (err) => {
        if (err) {
            return response.status(500).json({ error: err.message });
        }

        response.json({ message: "Dog breed deleted successfully" });
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});

async function fetchBreeds() {
    try {
        const response = await axios.get("http://localhost:3000/dogbreeds");
        console.log(response.data);
    } catch (error) {
        console.error("Error fetching dog breeds:", error.message);
    }
}

fetchBreeds();
