process.env.NODE_ENV = "test"

const request = require("supertest");
const app = require("../app");
const db = require("../db");
const Book = require("../models/book");


let book_isbn;

beforeEach(async function (){
  let result = await db.query(`
    INSERT INTO 
      books (isbn, amazon_url,author,language,pages,publisher,title,year)   
      VALUES(
        '123456789', 
        'https://amazon.com/bread', 
        'Tester', 
        'English', 
        75,  
        'Test Publishings', 
        'First Test Book', 
        2021) 
      RETURNING isbn`);

  book_isbn = result.rows[0].isbn
});


describe("POST /books", async function () {
  test("Creates new book", async function () {
    const resp = await request(app)
        .post(`/books`)
        .send({
          isbn: '987654321',
          amazon_url: "https://amazon.com/gym",
          author: "Tester 2",
          language: "English",
          pages: 100,
          publisher: "Test Publishers",
          title: "Test Book 2",
          year: 1999
        });
    expect(resp.statusCode).toBe(201);
    expect(resp.body.book).toHaveProperty("isbn");
  });
});

describe("GET /books", async function () {
    test("Gets all books", async function () {
        const resp = await request(app).get('/books');
        const books = resp.body.books;
        expect(resp.statusCode).toBe(200);
        expect(books[0]).toHaveProperty("isbn")
    })
})

describe("GET /books/:isbn", async function () {
    test("Gets single book", async function () {
        const resp = await request(app).get(`/books/${book_isbn}`)
        expect(resp.statusCode).toBe(200);
        expect(resp.body.book).toHaveProperty("isbn");
    })
      test("Creates 404 error if unable to find book", async function () {
          const resp = await request(app).get(`/books/111111111`)
          expect(resp.statusCode).toBe(404);
  });
})

describe("DELETE /books/:isbn", function () {
  test("Deletes a book", async function () {
    const resp = await request(app).delete(`/books/${book_isbn}`)
    expect(resp.body).toEqual({message: "Book deleted"});
  });
});

afterEach(async function () {
    await db.query("DELETE FROM books")
})

afterAll(async function () {
    await db.end()
})