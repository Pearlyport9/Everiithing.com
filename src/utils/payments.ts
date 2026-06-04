const COMMISSION_RATE = parseFloat(
  process.env.PLATFORM_COMMISSION_RATE || '0.18',
)

export function calculateCommission(priceNgn: number) {
  const commission = Math.round(priceNgn * COMMISSION_RATE)
  const providerPayout = priceNgn - commission

  return {
    totalPrice: priceNgn,
    platformFee: commission,
    providerPayout,
  }
}
