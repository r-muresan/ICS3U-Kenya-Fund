const dotenv = require('dotenv');
dotenv.config();

const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STATIC_DIR = __dirname;
const DOMAIN = process.env.DOMAIN;
const CURRENCY = 'cad';
const PAYMENT_METHODS = "card";
const MONGODB_PASS = process.env.MONGODB_PASS;

const express = require("express");
const app = express();
const { resolve } = require("path");
const stripe = require("stripe")(STRIPE_SECRET_KEY);
var http = require('http').createServer(app);

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://Bullmeza:" + MONGODB_PASS + "@cluster0-k94hv.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(express.static(STATIC_DIR));
app.use(
    express.json({
        // We need the raw body to verify webhook signatures.
        // Let's compute it only when hitting the Stripe webhook endpoint.
        verify: function(req, res, buf) {
            if (req.originalUrl.startsWith("/webhook")) {
                req.rawBody = buf.toString();
            }
        }
    })
);

app.get("/", (req, res) => {
    const path = resolve(STATIC_DIR + "/index.html");
    res.sendFile(path);

});

app.get("/config", (req, res) => {
    res.send({
        publicKey: STRIPE_PUBLISHABLE_KEY,
        currency: CURRENCY,
        quantity: 1,
    });
});

app.get("/goals", (req, res) => {
    const a = { name: "School", price: 30, img: "http://www.clker.com/cliparts/7/b/s/G/9/a/1-inside-a-circle-md.png" };
    const b = { name: "Goal2", price: 50, img: "http://www.clker.com/cliparts/q/y/Z/9/w/O/2-inside-a-circle-md.png" };
    const c = { name: "Goal3", price: 100, img: "http://www.clker.com/cliparts/d/0/R/s/m/l/3-inside-a-circle-md.png" };
    const d = { name: "Goal4", price: 200, img: "https://www.clipartsfree.net/vector/large/43850-white-numeral-4-inside-green-circle-clipart.png" };


    res.send([a, b, c, d]);
});




app.get("/retrieve", (req, res) => {
    client.connect(err => {
        if (err) { console.log(err); }
        client.db("KenyaFund").collection("Purchases").find().toArray()
            .then((result) => {
                res.send({
                    data: result
                });
            }).catch((e) => {
                console.log(e);
            });
    });
});

app.post("/sendInfo", (req, res) => {
    const { name, sessionJSON } = req.body;
    client.connect(err => {
        client.db("KenyaFund").collection("Purchases").insertOne({ name: name, paymentInfo: sessionJSON });
    });
});




// Fetch the Checkout Session to display the JSON result on the success page
app.get("/checkout-session", async(req, res) => {
    const { sessionId } = req.query;
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    res.send(session);
});

app.post("/create-checkout-session", async(req, res) => {
    const domainURL = DOMAIN;
    const { price } = req.body;
    // Create new Checkout Session for the order
    // Other optional params include:
    // [billing_address_collection] - to display billing address details on the page
    // [customer] - if you have an existing Stripe Customer ID
    // [payment_intent_data] - lets capture the payment later
    // [customer_email] - lets you prefill the email input in the form
    // For full details see https://stripe.com/docs/api/checkout/sessions/create
    const session = await stripe.checkout.sessions.create({
        payment_method_types: PAYMENT_METHODS.split(", "),
        line_items: [{
            name: "Me to We Donation",
            images: ["https://cdn.we.org/files/2014/07/06092_Malala-Kenya_%C2%A9TanyaMalott-2014.jpg?_ga=2.255382856.1713335856.1585779442-1008224760.1578866354"],
            quantity: 1,
            currency: CURRENCY,
            amount: price
        }],
        // ?session_id={CHECKOUT_SESSION_ID} means the redirect will have the session ID set as a query param
        success_url: `${domainURL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${domainURL}/index.html`
    });

    res.send({
        sessionId: session.id
    });
});

http.listen(process.env.PORT, function() {
    console.log(`Your port is ${process.env.PORT}`);
});