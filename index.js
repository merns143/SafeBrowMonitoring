const express = require('express');
const PORT = process.env.PORT || 3001;
const server = express();
const axios = require('axios');
const cors = require('cors');
server.use(express.json());
server.use(express.urlencoded({
    extended: true
}));

server.use(cors({
    origin: "*"
}));
server.use(cors({
    methods: ["GET", "POST"]
}));

var webhookUrl = "https://snowballcompany.webhook.office.com/webhookb2/710b9309-8b4d-4ba8-9574-921f48cdfc44@caf560d4-f4f6-4071-8442-abab6b7b7122/IncomingWebhook/dc5953fc3bad4c9389836b8530335ef4/6d105f93-f0c4-4e82-adea-d784761d81bf";

server.post("/api/send", async (req, res) => {
    var cardJson = {
        themeColor: "0076D7",
        summary: "Description",
        sections: [{
            activityTitle: req.query.message,
            markdown: true
        }]
    };

    await axios.post(webhookUrl, cardJson)
        .then(() => {
            res.send("Success");
        })
        .catch(error => {
            console.error(error);
            res.send("Failed");
        });
});

server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${ PORT }`);
});
