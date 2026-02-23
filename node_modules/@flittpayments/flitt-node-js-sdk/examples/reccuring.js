'use strict'

const FlittPay = require('../lib')

const flitt = new FlittPay(
  {
    merchantId: 1549901,
    secretKey: 'test'
  }
)
const data = {
  order_desc: 'test order',
  currency: 'GEL',
  amount: '1000',
  rectoken: 'b037ba5501956289d7a2094dee020e6560de04'
}
flitt.Recurring(data).then(data => {
  console.log(data)
}).catch((error) => {
  console.log(error)
})
