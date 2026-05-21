function resolveIntlLocale(language) {
  return language === 'en' ? 'en-GB' : 'fr-FR'
}

function formatPrice(value, intlLocale) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return '—'
  return new Intl.NumberFormat(intlLocale, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(numeric)
}

function formatDate(iso, intlLocale) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString(intlLocale, {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

function formatAddressLines(address) {
  if (!address) return []
  const lines = []
  const name = [address.firstname, address.lastname].filter(Boolean).join(' ')
  if (name) lines.push(name)
  if (address.adresse1) lines.push(address.adresse1)
  if (address.adresse2) lines.push(address.adresse2)
  const cityLine = [address.zipCode, address.city].filter(Boolean).join(' ')
  if (cityLine) lines.push(cityLine)
  if (address.region) lines.push(address.region)
  if (address.country) lines.push(address.country)
  if (address.mobilephone) lines.push(address.mobilephone)
  return lines
}

export async function downloadInvoicePdf(order, options = {}) {
  const { language = 'fr', strings } = options
  const intlLocale = resolveIntlLocale(language)
  const labels = {
    invoice: 'Facture',
    invoiceNumber: 'Numéro',
    invoiceDate: 'Date',
    status: 'Statut',
    paidAt: 'Payée le',
    paymentRef: 'Réf. paiement',
    billTo: 'Facturé à',
    issuer: 'Émetteur',
    item: 'Article',
    quantity: 'Qté',
    duration: 'Durée',
    durationUnit: 'mois',
    unitPrice: 'PU HT',
    lineTotal: 'Total',
    subtotal: 'Sous-total',
    vatLine: 'TVA incluse',
    total: 'Total TTC',
    footer:
      'CYNA — SAS au capital de 10 000 € — RCS Paris 000 000 000 — TVA FR00 000000000\nhello@cyna.fr · 28 rue de Rivoli, 75004 Paris',
    company: 'CYNA',
    ...(strings ?? {}),
  }

  const [{ default: jsPDF }, autoTableModule] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ])
  const autoTable = autoTableModule.default ?? autoTableModule.autoTable ?? autoTableModule
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const marginX = 16

  const orderRef = order.reference ?? `#${order.id}`
  const issuedAt = formatDate(order.createdAt, intlLocale)
  const paidAt = order.paidAt ? formatDate(order.paidAt, intlLocale) : null

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(20, 24, 58)
  doc.text(labels.company, marginX, 22)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(100, 116, 139)
  doc.text(labels.invoice.toUpperCase(), pageWidth - marginX, 22, { align: 'right' })

  doc.setFontSize(10)
  doc.setTextColor(20, 24, 58)
  const headerLines = [
    `${labels.invoiceNumber} : ${orderRef}`,
    `${labels.invoiceDate} : ${issuedAt}`,
    `${labels.status} : ${order.status ?? '—'}`,
  ]
  if (paidAt) headerLines.push(`${labels.paidAt} : ${paidAt}`)
  if (order.stripePaymentIntentId) {
    headerLines.push(`${labels.paymentRef} : ${order.stripePaymentIntentId}`)
  }
  doc.text(headerLines, pageWidth - marginX, 30, { align: 'right' })

  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.3)
  const headerBottom = 30 + headerLines.length * 5
  doc.line(marginX, headerBottom + 4, pageWidth - marginX, headerBottom + 4)

  const blockY = headerBottom + 14
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(71, 85, 105)
  doc.text(labels.billTo.toUpperCase(), marginX, blockY)
  doc.text(labels.issuer.toUpperCase(), pageWidth / 2 + 4, blockY)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(20, 24, 58)
  const billingLines = formatAddressLines(order.billingAddress)
  const fallbackName = order.user
    ? [order.user.firstname, order.user.lastname].filter(Boolean).join(' ')
    : ''
  const billingFallback = []
  if (fallbackName) billingFallback.push(fallbackName)
  if (order.user?.email) billingFallback.push(order.user.email)
  doc.text(
    billingLines.length > 0 ? billingLines : billingFallback.length > 0 ? billingFallback : ['—'],
    marginX,
    blockY + 6
  )

  doc.text(
    [labels.company, '28 rue de Rivoli', '75004 Paris', 'France', 'hello@cyna.fr'],
    pageWidth / 2 + 4,
    blockY + 6
  )

  const tableStartY = blockY + 6 + Math.max(billingLines.length, 5) * 5 + 6
  const items = Array.isArray(order.items) ? order.items : []
  const rows = items.map((item) => {
    const name = item.productNameSnapshot ?? item.saasService?.name ?? '—'
    const unit = Number(item.unitPriceSnapshot ?? item.saasService?.price ?? 0)
    const months = Number(item.durationMonths ?? 1)
    const quantity = Number(item.quantity ?? 1)
    const lineTotal = unit * quantity * months
    return [
      name,
      String(quantity),
      `${months} ${labels.durationUnit}`,
      formatPrice(unit, intlLocale),
      formatPrice(lineTotal, intlLocale),
    ]
  })

  autoTable(doc, {
    startY: tableStartY,
    head: [[labels.item, labels.quantity, labels.duration, labels.unitPrice, labels.lineTotal]],
    body: rows,
    theme: 'plain',
    styles: { font: 'helvetica', fontSize: 10, cellPadding: 3, textColor: [20, 24, 58] },
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [71, 85, 105],
      fontStyle: 'bold',
      lineWidth: 0,
    },
    bodyStyles: { lineWidth: 0.1, lineColor: [226, 232, 240] },
    columnStyles: {
      1: { halign: 'right', cellWidth: 18 },
      2: { halign: 'right', cellWidth: 24 },
      3: { halign: 'right', cellWidth: 28 },
      4: { halign: 'right', cellWidth: 32, fontStyle: 'bold' },
    },
    margin: { left: marginX, right: marginX },
  })

  const afterTableY = doc.lastAutoTable?.finalY ?? tableStartY + 20
  const totalsX = pageWidth - marginX
  let totalsY = afterTableY + 10

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(71, 85, 105)
  doc.text(`${labels.subtotal} :`, totalsX - 50, totalsY, { align: 'right' })
  doc.text(formatPrice(order.totalPrice, intlLocale), totalsX, totalsY, { align: 'right' })

  totalsY += 6
  doc.text(`${labels.vatLine}`, totalsX - 50, totalsY, { align: 'right' })

  totalsY += 9
  doc.setDrawColor(20, 24, 58)
  doc.setLineWidth(0.4)
  doc.line(totalsX - 70, totalsY - 4, totalsX, totalsY - 4)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(20, 24, 58)
  doc.text(`${labels.total}`, totalsX - 50, totalsY + 2, { align: 'right' })
  doc.text(formatPrice(order.totalPrice, intlLocale), totalsX, totalsY + 2, { align: 'right' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(100, 116, 139)
  const pageHeight = doc.internal.pageSize.getHeight()
  doc.text(labels.footer, marginX, pageHeight - 14)

  doc.save(`facture-${orderRef.replace(/[^A-Za-z0-9-_]/g, '')}.pdf`)
}
