'use strict'

const FlittPay = require('../lib')

const flitt = new FlittPay(
  {
    merchantId: 1549901,
    secretKey: 'test'
  }
)
const dataS1 = {
  order_id: Date.now(),
  order_desc: 'test order',
  currency: 'GEL',
  amount: '1000',
  card_number: '4444555566661111',
  cvv2: '222',
  expiry_date: '1232'
}
// After redirect get md && pares
flitt.PciDssOne(dataS1).then(data => {
  const dataStwo = {
    order_id: dataS1.order_id,
    md: '',
    pares: ''
  }
  console.log(data)
  flitt.PciDssTwo(dataStwo).then(data => {
    console.log(data)
  }).catch((error) => {
    console.log(error)
  })
})
