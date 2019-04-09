const { API_KEY, CMS_ID, DEFAULT_EMPTY_VALUE } = require('../config/index');

const getCurrentStatus = ({
  was_paid: wasPaid = false,
  was_shipped: wasShipped = false,
  shipping_details: { is_delivered: isDelivered = false } = {},
} = {}) => {
  if (!wasPaid) return 'not paid';
  if (wasPaid && !wasShipped) return 'processing';
  if (wasShipped) return 'shipped';
  if (isDelivered) return 'delivered';
  return 'No status';
};

const serialize = (data) => {
  const newData = {
    status: getCurrentStatus(data),
    receiptId: data.receipt_id,
    OUTVIO_PARAMS: {
      API_KEY,
      CMS_ID,
      id: data.order_id,
      dateTime: new Date(data.creation_tsz),
    },
    payment: {
      status: data.was_paid ? 'paid' : 'not paid',
      method: data.payment_method,
      total: data.total_price && parseFloat(data.total_price),
      currency: data.currency_code,
      tax: data.total_tax_cost && parseFloat(data.total_tax_cost),
    },
    products: data.Transactions.map(item => ({
      name: item.title,
      price: item.price && parseFloat(item.price),
      discountPrice: data.discount_amt && parseFloat(data.discount_amt),
      vat: DEFAULT_EMPTY_VALUE,
      quantity: item.quantity && parseFloat(item.quantity),
      barcode: DEFAULT_EMPTY_VALUE,
      sku: item.product_data.sku,
      variant: Boolean(item.variations.length)
      && item.variations[0].formatted_value
      && item.variations[0].formatted_name
      && `${item.variations[0].formatted_name}: ${item.variations[0].formatted_value}`,
      hsCode: DEFAULT_EMPTY_VALUE,
      weight: item.Listing.item_width && parseFloat(item.Listing.item_width / 1000 || 0),
      pictureUrl: item.Listing.MainImage.url_fullxfull,
      description: item.description,
      invoicingCompany: DEFAULT_EMPTY_VALUE,
      invoicingCompanyTaxId: DEFAULT_EMPTY_VALUE,
      returnable: false,
    })),
    client: {
      delivery: {
        name: data.name,
        dni: DEFAULT_EMPTY_VALUE,
        postcode: data.zip,
        countryCode: data.country_id,
        state: data.state,
        city: data.sity,
        address: `${data.first_line} ${data.second_line}`,
        email: data.buyer_email,
        phone: DEFAULT_EMPTY_VALUE,
        comment: data.message_from_buyer,
      },
      invoicing: {
        name: DEFAULT_EMPTY_VALUE,
        postcode: DEFAULT_EMPTY_VALUE,
        countryCode: DEFAULT_EMPTY_VALUE,
        state: DEFAULT_EMPTY_VALUE,
        city: DEFAULT_EMPTY_VALUE,
        address: DEFAULT_EMPTY_VALUE,
        email: DEFAULT_EMPTY_VALUE,
        phone: DEFAULT_EMPTY_VALUE,
      },
    },
    shipping: {
      price: data.total_shipping_cost && parseFloat(data.total_shipping_cost),
      method: data.shipping_details.shipping_method,
      invoiceUrl: DEFAULT_EMPTY_VALUE,
      invoiceNumber: DEFAULT_EMPTY_VALUE,
    },
  };
  return newData;
};

module.exports = {
  serialize,
};
