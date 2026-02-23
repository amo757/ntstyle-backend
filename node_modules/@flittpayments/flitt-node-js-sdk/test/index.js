'use strict'

const chai = require('chai')
const expect = chai.expect
const FlittPay = require('../lib')

const flitt = new FlittPay(
  {
    protocol: '1.0',
    merchantId: 1549901,
    baseUrl: 'pay.flitt.com',
    secretKey: 'test',
    creditKey: 'testcredit',
    contentType: 'json'
  }
)

describe('Main API', function () {
  this.timeout(15000)
  describe('API v1', function () {
    it('create subscription url', async () => {
      const date = '2070-05-05'
      const dataCheckout = {
        order_desc: 'test order',
        currency: 'GEL',
        amount: 1000,
        recurring_data:
          {
            every: 5,
            period: 'day',
            amount: 1000,
            start_time: date,
            state: 'y',
            Readonly: 'n'
          }
      }
      await flitt.Subscription(dataCheckout).then(data => {
        expect(data.checkout_url).to.contain('pay.flitt.com')
      })
    })
    it('create checkout url', async () => {
      const dataCheckout = {
        order_desc: 'order url',
        currency: 'GEL',
        amount: '1000'
      }
      await flitt.Checkout(dataCheckout).then(data => {
        expect(data.checkout_url).to.contain('pay.flitt.com')
      })
    })
    it('reccuring', async () => {
      const dataApprovedOrder = {
        order_desc: 'test order',
        currency: 'GEL',
        amount: '1000',
        card_number: '4444555511116666',
        cvv2: '333',
        expiry_date: '1232',
        required_rectoken: 'Y'
      }
      let rectoken = ''
      await flitt.PciDssOne(dataApprovedOrder).then(data => {
        rectoken = data['rectoken']
      })

      const data = {
        order_desc: 'test order',
        currency: 'GEL',
        amount: '1000',
        rectoken: rectoken
      }
      await flitt.Recurring(data).then(data => {
        expect(data).to.not.be.empty
        expect(data.masked_card).equal('444455XXXXXX6666')
        expect(data.response_status).equal('success')
      })
    })
    it('reports', async () => {
      const now = new Date()
      const NotNow = new Date()
      NotNow.setHours(NotNow.getHours() - 1)

      const data = {
        date_from: NotNow,
        date_to: now
      }
      await flitt.Reports(data).then(data => {
        expect(data).to.not.be.empty
      })
    })
    it('create p2pcredit', async () => {
      const dataCheckout = {
        order_desc: 'test order',
        currency: 'GEL',
        amount: '1000',
        receiver_card_number: '4444555511116666'
      }
      await flitt.P2pcredit(dataCheckout).then(data => {
        expect(data.response_status).equal('success')
      })
    })
    it('create checkout token', async () => {
      const dataCheckout = {
        order_desc: 'order token',
        currency: 'GEL',
        amount: '1000'
      }
      await flitt.CheckoutToken(dataCheckout).then(data => {
        expect(data.token).to.not.be.empty
      })
    })
    it('create verification url', async () => {
      const dataVerification = {
        order_desc: 'order token',
        currency: 'GEL'
      }
      await flitt.Verification(dataVerification).then(data => {
        expect(data.checkout_url).to.not.be.empty
      })
    })
    it('pci dss step one', async () => {
      const dataApprovedOrder = {
        order_desc: 'test order',
        currency: 'GEL',
        amount: '1000',
        card_number: '4444555511116666',
        cvv2: '333',
        expiry_date: '1232',
        preauth: 'Y'
      }
      await flitt.PciDssOne(dataApprovedOrder).then(data => {
        expect(data.response_status).equal('success')
        expect(data.order_status).equal('approved')
      })
    })
    it('pci dss step two', async () => {
      const dataApprovedOrder = {
        order_desc: 'test order',
        currency: 'GEL',
        amount: '1000',
        card_number: '4444555566661111',
        cvv2: '333',
        expiry_date: '1232',
        preauth: 'Y'
      }
      await flitt.PciDssOne(dataApprovedOrder).then(data => {
        expect(data.response_status).equal('success')
        expect(data.acs_url).contain('https://pay.flitt.com/acs/')
      })
    })
    it('capture order', async () => {
      const dataApprovedOrder = {
        order_desc: 'test order',
        currency: 'GEL',
        amount: '1000',
        card_number: '4444555511116666',
        cvv2: '333',
        expiry_date: '1232',
        preauth: 'Y'
      }
      const orderId = await flitt.PciDssOne(dataApprovedOrder).then(data => {
        return data.order_id
      })
      const captureData = {
        currency: 'GEL',
        amount: '1000',
        order_id: orderId
      }
      await flitt.Capture(captureData).then(dataC => {
        expect(dataC.response_status).equal('success')
        expect(dataC.capture_status).equal('captured')
      })
    })
    it('reverse order', async () => {
      const dataApprovedOrder = {
        order_desc: 'test order',
        currency: 'GEL',
        amount: '1000',
        card_number: '4444555511116666',
        cvv2: '333',
        expiry_date: '1232',
        preauth: 'Y'
      }
      const orderId = await flitt.PciDssOne(dataApprovedOrder).then(data => {
        return data.order_id
      })
      const reverseData = {
        currency: 'GEL',
        amount: '1000',
        order_id: orderId
      }
      await flitt.Reverse(reverseData).then(dataC => {
        expect(dataC.response_status).equal('success')
        expect(dataC.reverse_status).equal('approved')
        expect(dataC.reversal_amount).equal('1000')
      })
    })
    it('status order', async () => {
      const dataApprovedOrder = {
        order_desc: 'test order',
        currency: 'GEL',
        amount: '1000',
        card_number: '4444555511116666',
        cvv2: '333',
        expiry_date: '1232',
        preauth: 'Y'
      }
      const orderId = await flitt.PciDssOne(dataApprovedOrder).then(data => {
        return data.order_id
      })
      const statGELata = {
        order_id: orderId
      }
      await flitt.Status(statGELata).then(dataC => {
        expect(dataC.response_status).equal('success')
        expect(dataC.order_status).equal('approved')
        expect(dataC.amount).equal('1000')
      })
    })
    it('transaction list order', async () => {
      const dataApprovedOrder = {
        order_desc: 'test order',
        currency: 'GEL',
        amount: '1000',
        card_number: '4444555511116666',
        cvv2: '333',
        expiry_date: '1232',
        preauth: 'Y'
      }
      const orderId = await flitt.PciDssOne(dataApprovedOrder).then(data => {
        return data.order_id
      })
      const listData = {
        order_id: orderId
      }
      await flitt.TransactionList(listData).then(dataC => {
        dataC.forEach(function (tr) {
          expect(tr.eci).equal('7')
          expect(tr.transaction_status).equal('approved')
        })
      })
    })
  })
})
