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

// var webhookUrl = "https://snowballcompany.webhook.office.com/webhookb2/710b9309-8b4d-4ba8-9574-921f48cdfc44@caf560d4-f4f6-4071-8442-abab6b7b7122/IncomingWebhook/dc5953fc3bad4c9389836b8530335ef4/6d105f93-f0c4-4e82-adea-d784761d81bf";

var webhookUrl = "https://snowballcompany.webhook.office.com/webhookb2/710b9309-8b4d-4ba8-9574-921f48cdfc44@caf560d4-f4f6-4071-8442-abab6b7b7122/IncomingWebhook/9109e36715cc4614ba67fdb848aa970a/6d105f93-f0c4-4e82-adea-d784761d81bf";

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
            res.send("Message sent.");
        })
        .catch(error => {
            console.error(error);
            res.send("Failed");
        });
});

async function runScript() {
    const sbrowdomains = "http://sbrow.glowlytics.com/api/domains"
    const sbrowurls = "https://sbrow.glowlytics.com/api/available-urls"

    let totalBrokenUrl = process.env.broken_url //42295
    let totalFineUrl = process.env.fine_url //1369
    let ownURL = process.env.api_url
    setInterval(async () => {
        

        let broUrlHTTP = 0
        let broUrlHTTPS = 0
        let fiUrlHTTP = 0
        let fiUrlHTTPS = 0
        await axios.get(sbrowurls).then(res => {
            broUrlHTTP = res.data.data.filter(x => x.broken == 1 && x.type == "http:")[0].counts
            broUrlHTTPS = res.data.data.filter(x => x.broken == 1 && x.type == "https")[0].counts
            fiUrlHTTP = res.data.data.filter(x => x.broken == 0 && x.type == "http:")[0].counts
            fiUrlHTTPS = res.data.data.filter(x => x.broken == 0 && x.type == "https")[0].counts
        }).catch(err => {
            console.log(err)
        })

        const totalBroke = broUrlHTTP + broUrlHTTPS
        const totalFine = fiUrlHTTP + fiUrlHTTPS

        let theMsg = null
        if (totalBroke > totalBrokenUrl && totalFine < totalFineUrl) {
            if ((totalFineUrl - totalFine) == (totalBroke - totalBrokenUrl)) {
                theMsg = "Nag taas ang count sa Broken/Flagged urls = " + (totalFineUrl - totalFine)
            } 
        }

        if (theMsg) {
            totalFineUrl = totalFine
            totalBrokenUrl = totalBroke
            console.log("Messaging...")
            await axios.post(ownURL + "/api/send?message=" + theMsg)
                .then((res) => {
                    console.log(res.data)
                })
                .catch(error => {
                    console.error(error);
                });
        } else {
            console.log("No changes ...")
        }
        
    // }, 600000);
    }, 30000);
    
}

server.listen(PORT, () => {
    setTimeout(() => {
        runScript();
    }, 1000)
});
