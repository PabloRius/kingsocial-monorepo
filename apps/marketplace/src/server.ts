import { app } from "./app";

const PORT = parseInt(process.env.PORT || "3001") || 3001;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Marketplace component running on http://localhost:${PORT}`);
});
