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
  card_number: '4444555511116666',
  cvv2: '333',
  expiry_date: '1232',
  client_ip: '127.2.2.1'
}
flitt.PciDssOne(data).then(data => {
  console.log(data)
  console.log(flitt.isValidResponse(data))
}).catch((error) => {
  console.log(error)
})
