const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const {Translate} = require('@google-cloud/translate');
const Chatkit = require('@pusher/chatkit-server');
const resolve =  require("path").resolve;

require('dotenv').config({path:  resolve(__dirname, "../.env")})

const app = express();
const port = process.env.APP_PORT

// Initialises chatkit client
const chatkit = new Chatkit.default({
    instanceLocator: process.env.CHATKIT_INSTANCE_LOCATOR,
    key: process.env.CHATKIT_SECRET_KEY
})

// Instantiates a client
const translate = new Translate({
    projectId: process.env.YOUR_PROJECT_ID,
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/translate', async (req, res) => {
    const messages = req.body.payload.messages
    const data = extractData(messages[0]['parts'][0]['content'])
    const room_id = req.body.payload.messages[0]['room_id']

    // Retrun response early - see https://pusher.com/docs/chatkit/webhooks#retry-strategy
    res.sendStatus(200)
    
    if (data) {
        const {text, language} = data

        const langCode = await getLanguageCode(language)

        if (!langCode) {
            trbotSendMessage(room_id, 'Sorry, you need to pass in a valid language' )
        }
        
        const translation = await translate.translate(text, langCode)

        trbotSendMessage(room_id, translation[0] )
    } 
})

app.get('/get_rooms', (req, res) => {
    chatkit.getRooms({})
        .then(rooms => {
            res.status(200).send({
                status: 'success',
                data: rooms
            });
        })
        .catch(err => {
            res.status(200).send({
                status: 'error',
                message: err
            });
        })
})

async function getLanguageCode(lang) {
    const [languages] = await translate.getLanguages();

    var foundLang = languages.find((language) => {
        return (language.code ===  lang.toLowerCase() 
            || language.name.toLowerCase() === lang.toLowerCase());
    });

    return foundLang ? foundLang.code : false;
}

function extractData(data) {
    const regex = /(@trbot)\s+translate.*['"](.+)['"].*to\W*(\w+)/gim

    const found = regex.exec(data);

    if (!found || found.length < 4) {
      return false
    }

    return {text: found[2], language: found[3]}
}

function trbotSendMessage(roomId, message) {
    return chatkit.sendSimpleMessage({
        userId: 'trbot',
        roomId: roomId,
        text: message,
    })
}

app.get('/', async (req, res) => {
    res.send({ hello: 'World!'});
});

app.listen(port, () => console.log(`Node app listening on port ${port}!`));