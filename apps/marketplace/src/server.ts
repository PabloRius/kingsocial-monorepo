import { app } from "./app";

const PORT = 4000;

app.listen(PORT, () => {
  console.log(`Users service running on http://localhost:${PORT}`);
});
