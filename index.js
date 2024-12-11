const express = require('express')
const app = express()

require('dotenv').config();
const port = process.env.PORT

const route = require("./routers/index_router.js")

// router
route(app)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})