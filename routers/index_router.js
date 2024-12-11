const homeRouter = require("../routers/home_router.js");

module.exports = (app) => {
    app.use('/', homeRouter);
}