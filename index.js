const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const stripe = require("stripe")(process.env.Secret_key);

const PORT = 8080;
const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/payment-sheet", async (req, res) => {
  const amount = await req.body.amount;
  const customer = await stripe.customers.create();
  const ephemeralKey = await stripe.ephemeralKeys.create(
    { customer: customer.id },
    { apiVersion: "2025-05-28.basil" }
  );
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount,
    currency: "ngn",
    customer: customer.id,
    payment_method_types: [
      "bancontact",
      "card",
      "ideal",
      "klarna",
      "sepa_debit",
    ],
  });

  res.json({
    paymentIntent: paymentIntent.client_secret,
    ephemeralKey: ephemeralKey.secret,
    customer: customer.id,
    publishableKey: process.env.STRIP_PULISHBALEKEY,
  });
});

app.listen(PORT, () => {
  console.log("server is running at port", PORT);
});
