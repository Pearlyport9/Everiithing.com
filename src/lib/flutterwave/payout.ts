interface ProviderBankDetails {
  bank_code: string
  account_number: string
}

async function getProviderBankDetails(
  _providerId: string,
): Promise<ProviderBankDetails> {
  return { bank_code: '', account_number: '' }
}

export async function triggerProviderPayout(
  providerId: string,
  amountNgn: number,
) {
  const provider = await getProviderBankDetails(providerId)

  const res = await fetch('https://api.flutterwave.com/v3/transfers', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      account_bank: provider.bank_code,
      account_number: provider.account_number,
      amount: amountNgn,
      currency: 'NGN',
      reference: `PAYOUT-${providerId}-${Date.now()}`,
      narration: 'Everiithing Job Payout',
    }),
  })

  return res.json()
}
