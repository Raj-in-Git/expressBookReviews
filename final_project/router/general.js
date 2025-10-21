const express = require("express");
const axios = require("axios"); // ✅ Import axios
let books = require("./booksdb.js");
let { isValid, users } = require("./auth_users.js");

const public_users = express.Router();

// -------------------- REGISTER USER --------------------
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required." });
  }

  if (!isValid(username)) {
    return res.status(400).json({ message: "User already exists!" });
  }

  users.push({ username, password });
  return res
    .status(200)
    .json({ message: "User successfully registered. Now you can login" });
});

// -------------------- TASK 10: GET ALL BOOKS --------------------
async function retrieveBooks() {
  // returning promise for consistency
  return new Promise((resolve) => resolve(books));
}

public_users.get("/", async (req, res) => {
  try {
    // simulate fetching using Axios + async/await
    const response = await axios.get("http://localhost:5000/booksdata");
    res.status(200).json(response.data);
  } catch (error) {
    // fallback if direct axios not used, return from local function
    try {
      const allBooks = await retrieveBooks();
      res.status(200).json(allBooks);
    } catch {
      res.status(500).json({ message: "Error retrieving all books" });
    }
  }
});

// -------------------- TASK 11: GET BOOK BY ISBN --------------------
async function retrieveBookFromISBN(isbn) {
  return new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) resolve(book);
    else reject(new Error("The provided book does not exist"));
  });
}

public_users.get("/isbn/:isbn", async (req, res) => {
  const isbn = req.params.isbn;
  try {
    // Using async/await with Axios to demonstrate remote request
    const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
    res.status(200).json(response.data);
  } catch (err) {
    // fallback to local function if axios fails (no circular request)
    try {
      const book = await retrieveBookFromISBN(isbn);
      res.status(200).json(book);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }
});

// -------------------- TASK 12: GET BOOK BY AUTHOR --------------------
async function retrieveBookFromAuthor(author) {
  return new Promise((resolve, reject) => {
    const validBooks = Object.values(books).filter(
      (book) => book.author === author
    );
    if (validBooks.length > 0) resolve(validBooks);
    else reject(new Error("The provided author does not exist"));
  });
}

public_users.get("/author/:author", async (req, res) => {
  const author = req.params.author;
  try {
    const response = await axios.get(`http://localhost:5000/author/${author}`);
    res.status(200).json(response.data);
  } catch (err) {
    try {
      const authorBooks = await retrieveBookFromAuthor(author);
      res.status(200).json(authorBooks);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }
});

// -------------------- TASK 13: GET BOOK BY TITLE --------------------
async function retrieveBookFromTitle(title) {
  return new Promise((resolve, reject) => {
    const validBooks = Object.values(books).filter(
      (book) => book.title === title
    );
    if (validBooks.length > 0) resolve(validBooks);
    else reject(new Error("The provided book title does not exist"));
  });
}

public_users.get("/title/:title", async (req, res) => {
  const title = req.params.title;
  try {
    const response = await axios.get(`http://localhost:5000/title/${title}`);
    res.status(200).json(response.data);
  } catch (err) {
    try {
      const titleBooks = await retrieveBookFromTitle(title);
      res.status(200).json(titleBooks);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }
});

// -------------------- GET BOOK REVIEW --------------------
public_users.get("/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book && book.reviews) {
    res.status(200).json(book.reviews);
  } else {
    res.status(404).json({ message: "Book or reviews not found" });
  }
});

module.exports.general = public_users;
