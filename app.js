const express = require('express');
const ejs = require('ejs');
const paypal = require('paypal-rest-sdk');

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AXbojPWul8BksrWbC0u7hFv8YEWGMQWnSNsePJKpVGcKVXOtOHUlLZNyAGhoH6OtZs-Dfsm2FqCxLUpq',
    'client_secret': 'EG4mQi6wI2qKY7v6K696y3Ll786Fx4rZ6ND8K2rif65M7U6RlEvtGW7yDGv47YVnJlvD1hoTDIewr8wy'
  });

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('views'));

app.get('/', (req,res) => res.render('index'));

app.post('/pay', (req,res) => {
    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3003/success",
            "cancel_url": "http://localhost:3003/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "Captain America T-Shirt",
                    "sku": "001",
                    "price": "675.00",
                    "currency": "INR",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "INR",
                "total": "675.00"
            },
            "description": "Black and white T-Shirt"
        }]
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            for(let i = 0;i < payment.links.length;i++){
              if(payment.links[i].rel === 'approval_url'){
                res.redirect(payment.links[i].href);
              }
            }
        }
    });
});

app.get('/success', (req,res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "INR",
                "total": "675.00"
            }
        }]
    };

    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            console.log(JSON.stringify(payment));
            res.send('Success');
        }
    });
});

app.get('/cancel', (req,res) => res.send('Cancelled'));


app.listen(3003, () => console.log('Server Started'));