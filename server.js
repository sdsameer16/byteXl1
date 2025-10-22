const express = require("express");
const fs = require("fs");
const app = express();
const PORT = 3000;
const FILE_PATH = "./books.json";

app.use(express.json());

function readBooks() {
  try {
    const data = fs.readFileSync(FILE_PATH, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading books file:", err.message);
    return [];
  }
}


function writeBooks(books) {
  try {
    fs.writeFileSync(FILE_PATH, JSON.stringify(books, null, 2));
  } catch (err) {
    console.error("Error:", err.message);
  }
}


app.get("/books", (req, res) => {
  const books = readBooks();
  res.json(books);
});


app.get("/books/available", (req, res) => {
  const books = readBooks();
  const availableBooks = books.filter(b => b.available);
  res.json(availableBooks);
});


app.post("/books", (req, res) => {
  const { title, author, available } = req.body;

  if (!title || !author || typeof available !== "boolean") {
    return res.status(400).json({ error: "Invalid book data" });
  }

  const books = readBooks();
  const newId = books.length ? books[books.length - 1].id + 1 : 1;

  const newBook = { id: newId, title, author, available };
  books.push(newBook);
  writeBooks(books);

  res.status(201).json(newBook);
});


app.put("/books/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { title, author, available } = req.body;
  const books = readBooks();

  const index = books.findIndex(b => b.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Book not found" });
  }

  // Update only provided fields
  if (title !== undefined) books[index].title = title;
  if (author !== undefined) books[index].author = author;
  if (available !== undefined) books[index].available = available;

  writeBooks(books);
  res.json(books[index]);
});


app.delete("/books/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const books = readBooks();

  const index = books.findIndex(b => b.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Book not found" });
  }

  const deletedBook = books.splice(index, 1)[0];
  writeBooks(books);
  res.json({ message: "Book deleted", deletedBook });
});


app.listen(PORT, () => {
  console.log(`Server is runinnly  on http://localhost:${PORT}`);
});
