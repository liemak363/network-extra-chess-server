const database = require("../models/peers_model.js")

async function handleExisting(res, info_hash, peer_id) {
    const isExisting_peer = await database.checkExisting_peer(peer_id);
    if (!isExisting_peer) {
        res.send(
            `{
                "failure reason": "peer_id not found"
            }`
        )
        return false;
    }

    const isExisting_metainfo = await database.checkExisting_metainfo(info_hash);
    if (!isExisting_metainfo) {
        res.send(
            `{
                "failure reason": "metainfo not found"
            }`
        )
        return false;
    }

    const isExisting_metainfo_peer = await database.checkExisting_metainfo_peer(info_hash, peer_id);
    if (!isExisting_metainfo_peer) {
        res.send(
            `{
                "failure reason": "connection peer-metainfo not found"
            }`
        )
        return false;
    }

    return true;
}

async function checkStopped(info_hash, peer_id) {
    const info_metainfo_peer = await database.get_metainfo_peer(info_hash, peer_id);
    if (info_metainfo_peer[0].event_now == 'stopped') return true;
    return false;
}

async function checkCompleted(info_hash, peer_id) {
    const info_metainfo_peer = await database.get_metainfo_peer(info_hash, peer_id);
    if (info_metainfo_peer[0].event_now == 'completed') return true;
    return false;
}

// [GET] /
module.exports.home = async (req, res) => {
    // console.log(req);
    // console.log(req.socket.remoteAddress);
    // console.log(req.socket.remotePort);

    // res.send(req.socket.remoteAddress + ':' + req.socket.remotePort)

    const info_hash = req.query.info_hash;
    const peer_id = req.query.peer_id;
    const ip = req.query.ip;
    const port = req.query.port;
    const downloaded = req.query.downloaded;
    const left = req.query.left;
    const event = req.query.event;

    if (!info_hash) {
        res.send(
            `{
                "failure reason": "there is no info_hash in requirement"
            }`
        )
        return;
    }
    if (!peer_id) {
        res.send(
            `{
                "failure reason": "there is no peer_id in requirement"
            }`
        )
        return;
    }
    if (!ip) {
        res.send(
            `{
                "failure reason": "there is no ip in requirement"
            }`
        )
        return;
    }
    if (!port) {
        res.send(
            `{
                "failure reason": "there is no port in requirement"
            }`
        )
        return;
    }

    if (!event) {
        const isExisting = await handleExisting(res, info_hash, peer_id);
        if (!isExisting) return;

        const isStopped = await checkStopped(info_hash, peer_id);
        if (isStopped) {
            res.send(
                `{
                    "failure reason": "connection stopped"
                }`
            )
            return;
        }

        const isCompleted = await checkCompleted(info_hash, peer_id);
        if (isCompleted) {
            res.send(
                `{
                    warning_message: "peer is a seeder, no peer_list returned",
                    tracker_id: "",
                    peer_list: []
                }`
            )
            return;
        }

        let resObj = {
            warning_message: "",
            tracker_id: "",
            peer_list: []
        }

        await database.update_metainfo_peer(info_hash, peer_id, port, downloaded, left, "started");

        resObj.peer_list = await database.getPeerList(info_hash, peer_id);
        res.send(JSON.stringify(resObj));
        return;
    }

    if (event == "completed") {
        const isExisting = await handleExisting(res, info_hash, peer_id, port, downloaded, left, event);
        if (!isExisting) return;

        const isStopped = await checkStopped(info_hash, peer_id);
        if (isStopped) {
            res.send(
                `{
                    "failure reason": "connection stopped"
                }`
            )
            return;
        }

        let resObj = {
            warning_message: "",
            tracker_id: "",
            peer_list: []
        }

        const isCompleted = await checkCompleted(info_hash, peer_id);
        if (isCompleted) resObj.warning_message = "peer has already completed"

        await database.update_metainfo_peer(info_hash, peer_id, port, downloaded, left, event);
        res.send(JSON.stringify(resObj));
        return;
    }

    if (event == "stopped") {
        const isExisting = await handleExisting(res, info_hash, peer_id);
        if (!isExisting) return;

        // const isStopped = await checkStopped(info_hash, peer_id);
        // if (isStopped) {
        //     res.send(
        //         `{
        //             "failure reason": "connection stopped"
        //         }`
        //     )
        //     return;
        // }

        let resObj = {
            warning_message: "",
            tracker_id: "",
            peer_list: []
        }
        
        // await database.update_metainfo_peer(info_hash, peer_id, port, downloaded, left, event);
        try {
            await database.delete_metainfo_peer(peer_id, info_hash);
        }
        catch (err) {}
        res.send(JSON.stringify(resObj));
        return;
    }

    if (event == "started") {
        const isExisting_peer = await database.checkExisting_peer(peer_id);
        if (!isExisting_peer) await database.add_peer(peer_id, ip, port)

        const isExisting_metainfo = await database.checkExisting_metainfo(info_hash);
        if (!isExisting_metainfo) await database.add_metainfo(info_hash);

        const isExisting_metainfo_peer = await database.checkExisting_metainfo_peer(info_hash, peer_id);
        if (!isExisting_metainfo_peer) await database.add_metainfo_peer(info_hash, peer_id, downloaded, left, event);

        if (isExisting_peer && isExisting_metainfo && isExisting_metainfo_peer) {
            const isCompleted = await checkCompleted(info_hash, peer_id);
            if (isCompleted) {
                res.send(
                    `{
                        warning_message: "peer is a seeder, no peer_list returned",
                        tracker_id: "",
                        peer_list: []
                    }`
                )
                return;
            }

            await database.update_metainfo_peer(info_hash, peer_id, port, downloaded, left, event);
        }

        let resObj = {
            warning_message: "",
            tracker_id: "",
            peer_list: []
        }

        resObj.peer_list = await database.getPeerList(info_hash, peer_id);
        res.send(JSON.stringify(resObj));
        return;
    }
    
    // const results_query = await database.testData();
    // console.log(results_query);

    // await database.testData2();
    // console.log("ok");
    // res.send("ok");

    // res.send(
    //     `{
    //         "peer_list": 
    //             [
    //                 {
    //                     "peer_id": 1,
    //                     "ip": "192.168.1.3",
    //                     "port": 6881
    //                 },
    //                 {
    //                     "peer_id": 2,
    //                     "ip": "192.168.1.4",
    //                     "port": 6881
    //                 }
    //             ]
    //     }`
    // );
};