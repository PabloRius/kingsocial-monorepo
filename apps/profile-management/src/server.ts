import app from "./app";

const PORT = parseInt(process.env.PORT || "3002") || 3002;

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `Profile Management component running on http://localhost:${PORT}`
  );
});
