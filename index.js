import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import env from "dotenv";

const app = express();
const port = process.env.PORT || 3000;
env.config();
const { Pool } = pg;

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = [];
let id = 0;

app.get("/", async (req, res) => {
  try{
    const result = await db.query("SELECT * FROM items ORDER BY id ASC");
  const items = result.rows;
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: items,
  });
  }catch(err){
    console.log(err);
  }
  
});

app.post("/add",async (req, res) => {
  const item = req.body.newItem;
  const newId = id++
  try{
    await db.query("INSERT INTO items(id, title) VALUES ($1, $2)", [newId, item]);
    res.redirect("/");
  }catch(err){
    console.log(err);
  }
});

app.post("/edit", async (req, res) => {
  const input = req.body.updatedItemTitle;
  const id = req.body.updatedItemId;
  try{
    await db.query("UPDATE items SET title = $1 WHERE id = $2", [input, id]);
  res.redirect("/");
  }catch(err){
    console.log(err);
  }  

});

app.post("/delete", async (req, res) => {
  const id = req.body.deleteItemId;
  try{
    await db.query("DELETE FROM items WHERE id = $1", [id]);
    res.redirect("/");
  }catch(err){
    console.log(err);
  } 
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
