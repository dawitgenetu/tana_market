// Currency formatting utility
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'ETB 0.00'
  }
  return `ETB ${parseFloat(amount).toFixed(2)}`
}

export const formatPrice = (price, discount = 0) => {
  if (discount > 0) {
    const discountedPrice = price * (1 - discount / 100)
    return {
      original: formatCurrency(price),
      discounted: formatCurrency(discountedPrice),
      discount: discount
    }
  }
  return {
    original: formatCurrency(price),
    discounted: formatCurrency(price),
    discount: 0
  }
}

export const CURRENCY_SYMBOL = 'ETB'
export const CURRENCY_NAME = 'Ethiopian Birr'
