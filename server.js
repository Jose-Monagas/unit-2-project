require("dotenv").config(); // pulls environment variables from .env and makes it available to me
const app = require("./app");
const mongoose = require("mongoose");
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI);
mongoose.connection.once("open", () => console.log("Mongo is showing love"));

app.listen(PORT, () => {
  console.log(`I'm listening on port ${PORT}`);
});
