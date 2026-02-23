# Flitt NODEJS-SDK

<p align="center">
  <img width="200" height="200" src="https://flitt.com/wp-content/uploads/2024/09/Group.svg">
</p>
<p align="center">
	<a href="https://www.npmjs.com/package/flitt-node-js-sdk"><img src="https://img.shields.io/npm/v/FlittPay-node-js-sdk.svg" alt="raiting" /></a>
	<a href="https://www.npmjs.com/package/flitt-node-js-sdk"><img src="https://img.shields.io/npm/dt/FlittPay-node-js-sdk.svg" alt="raiting" /></a>
	<a href="https://www.npmjs.com/package/flitt-node-js-sdk"><img src="https://img.shields.io/npm/dw/FlittPay-node-js-sdk.svg" alt="raiting" /></a>
</p>

## Payment service provider
A payment service provider (PSP) offers shops online services for accepting electronic payments by a variety of payment methods including credit card, bank-based payments such as direct debit, bank transfer, and real-time bank transfer based on online banking. Typically, they use a software as a service model and form a single payment gateway for their clients (merchants) to multiple payment methods. 
[read more](https://en.wikipedia.org/wiki/Payment_service_provider)

## Installation

```cmd
npm install @flittpayments/flitt-node-js-sdk
```

#### Manual installation
```cmd
git clone -b master https://github.com/flittpayments/node-js-sdk.git
```

## Required
```
node >= 7
```
## Simple Start
```javascript
const FlittPay = require('@flittpayments/flitt-node-js-sdk')

const flitt = new FlittPay(
  {
    merchantId: 1549901,
    secretKey: 'test'
  }
)
const requestData = {
  order_id: 'Your Order Id',
  order_desc: 'test order',
  currency: 'GEL',
  amount: '1000'
}
flitt.Checkout(requestData).then(data => {
  console.log(data)
}).catch((error) => {
  console.log(error)
})

```
### Notice

```merchant_data``` must be string. 

Example:
```
 const merchant_data = JSON.stringify([{
    email: 'test@flitt.eu',
    comment: 'Some comment'
 }])
```
# Api

See [docs](https://docs.flitt.com/)

## Examples
[Checkout examples](https://github.com/flittpayments/node-js-sdk/tree/master/examples)
