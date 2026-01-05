import app from "./app";

const PORT = parseInt(process.env.PORT || "3003") || 3003;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Communities component running on http://localhost:${PORT}`);
});
