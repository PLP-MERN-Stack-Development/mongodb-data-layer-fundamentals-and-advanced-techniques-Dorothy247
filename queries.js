// queries.js
const { MongoClient } = require('mongodb');

async function main() {
  const uri = "mongodb://127.0.0.1:27017"; // Local MongoDB
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("plp_bookstore");
    const books = db.collection("books");

    // 1. Find all books in a specific genre
    const fictionBooks = await books.find({ genre: "Fiction" }).toArray();
    console.log("Fiction Books:", fictionBooks);

    // 2. Find books published after a certain year
    const recentBooks = await books.find({ published_year: { $gt: 1950 } }).toArray();
    console.log("Books published after 1950:", recentBooks);

    // 3. Find books by a specific author
    const orwellBooks = await books.find({ author: "George Orwell" }).toArray();
    console.log("Books by George Orwell:", orwellBooks);

    // 4. Update the price of a specific book
    await books.updateOne(
      { title: "The Alchemist" },
      { $set: { price: 11.99 } }
    );

    // 5. Delete a book by its title
    await books.deleteOne({ title: "Moby Dick" });

    // 6. Advanced query: books in stock and published after 2010
    const advancedQuery = await books.find({ in_stock: true, published_year: { $gt: 2010 } }).toArray();
    console.log("In stock & published after 2010:", advancedQuery);

    // 7. Projection example: title, author, price
    const projectedBooks = await books.find({}, { projection: { title: 1, author: 1, price: 1 } }).toArray();
    console.log("Projected fields:", projectedBooks);

    // 8. Sorting example: by price ascending
    const sortedBooksAsc = await books.find().sort({ price: 1 }).toArray();
    console.log("Books sorted by price ascending:", sortedBooksAsc);

    // 9. Pagination example: 5 books per page, skip first 5
    const paginatedBooks = await books.find().skip(5).limit(5).toArray();
    console.log("Paginated books:", paginatedBooks);

    // 10. Aggregation example: average price by genre
    const avgPriceByGenre = await books.aggregate([
      { $group: { _id: "$genre", avgPrice: { $avg: "$price" } } }
    ]).toArray();
    console.log("Average price by genre:", avgPriceByGenre);

    // 11. Aggregation: author with most books
    const topAuthor = await books.aggregate([
      { $group: { _id: "$author", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]).toArray();
    console.log("Author with most books:", topAuthor);

    // 12. Aggregation: group books by decade
    const booksByDecade = await books.aggregate([
      { $group: { _id: { $floor: { $divide: ["$published_year", 10] } }, count: { $sum: 1 } } }
    ]).toArray();
    console.log("Books grouped by decade:", booksByDecade);

    // 13. Create index on title
    await books.createIndex({ title: 1 });

    // 14. Compound index on author and published_year
    await books.createIndex({ author: 1, published_year: 1 });

    // 15. Explain query performance
    const explain = await books.find({ title: "The Alchemist" }).explain();
    console.log("Query explain output:", explain);

  } finally {
    await client.close();
  }
}

main().catch(console.error);
