import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { nanoid } from "nanoid";

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret_in_prod";

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// Database
const adapter = new JSONFile("db.json");
const db = new Low(adapter, { users: [], invoices: [] });
await db.read();
db.data ||= { users: [], invoices: [] };

// Seed default admin if not exists
if (!db.data.users.find(u => u.username === "admin")) {
  db.data.users.push({ id: nanoid(), username: "admin", password: "admin123" });
  await db.write();
}

// JWT auth middleware
function auth(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid token" });
  }
}

// Routes
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const user = db.data.users.find(
    u => u.username === username && u.password === password
  );
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: "2h" });
  res.json({ token });
});

app.get("/api/invoices", auth, async (req, res) => {
  res.json(db.data.invoices);
});

app.post("/api/invoices", auth, async (req, res) => {
  const lastInvoice = db.data.invoices.at(-1);
  const newNumber = lastInvoice ? lastInvoice.number + 1 : 1;
  const invoice = { id: nanoid(), number: newNumber, ...req.body };
  db.data.invoices.push(invoice);
  await db.write();
  res.json(invoice);
});

app.put("/api/invoices/:id", auth, async (req, res) => {
  const invoice = db.data.invoices.find(i => i.id === req.params.id);
  if (!invoice) return res.status(404).json({ message: "Not found" });
  Object.assign(invoice, req.body);
  await db.write();
  res.json(invoice);
});

app.delete("/api/invoices/:id", auth, async (req, res) => {
  db.data.invoices = db.data.invoices.filter(i => i.id !== req.params.id);
  await db.write();
  res.json({ message: "Deleted" });
});

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
