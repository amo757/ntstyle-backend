'use strict'

const FlittPay = require('../lib')

const flitt = new FlittPay(
  {
    merchantId: 1549901,
    secretKey: 'test',
    creditKey: 'testcredit'
  }
)
const data = {
  order_desc: 'test order',
  currency: 'GEL',
  amount: '1000',
  receiver_card_number: '4444555511116666'
}
flitt.P2pcredit(data).then(data => {
  console.log(data)
  console.log(flitt.isValidResponse(data, true))
}).catch((error) => {
  console.log(error)
})
