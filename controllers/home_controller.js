const database = require("../models/game_model.js")

// [GET] /
module.exports.home = async (req, res) => {
    const type = req.query.type;
    
    if (type === 'req') {
        const allGame = await database.getAllGame();
        res.send(JSON.stringify(allGame));
        return;
    }

    if (type === 'end') {
        const tag = req.query.tag;
        await database.finishGame(tag);
        res.send("")
        return;
    }

    if (type === 'start') {
        const tag = req.query.tag;
        const name = req.query.name;
        const ip = req.query.IP;
        const port = req.query.Port;
        await database.createGame(name, tag, ip, port);
        res.send("")
        return;
    }

    res.send("ok")
};