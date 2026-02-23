'use strict'

const FlittPay = require('../lib')

const flitt = new FlittPay(
  {
    merchantId: 1549901,
    secretKey: 'test'
  }
)
const now = new Date()
const NotNow = new Date()
NotNow.setHours(NotNow.getHours() - 1)

const data = {
  date_from: NotNow,
  date_to: now
}

flitt.Reports(data).then(data => {
  console.log(data)
}).catch((error) => {
  console.log(error)
})
