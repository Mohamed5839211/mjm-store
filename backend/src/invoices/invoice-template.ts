import { Prisma } from '@prisma/client';

interface InvoiceTemplateItem {
  quantity: number;
  unitPrice: number | string | Prisma.Decimal;
  product?: { name: string } | null;
  bundle?: { name: string } | null;
}

interface InvoiceTemplateData {
  invoiceNumber: string;
  createdAt: Date | string;
  totalAmount: number | string | Prisma.Decimal;
  vatAmount: number | string | Prisma.Decimal;
  order: {
    id: number;
    customer?: { name: string; phone: string; email: string } | null;
    items: InvoiceTemplateItem[];
    shippingFee: number | string | Prisma.Decimal;
    paymentMethod: string;
  };
}

export const generateInvoiceHtml = (invoice: InvoiceTemplateData) => {
  const { invoiceNumber, createdAt, order, totalAmount, vatAmount } = invoice;
  const { customer, items, shippingFee, paymentMethod } = order;

  const subTotal = Number(totalAmount) - Number(vatAmount);

  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <link href="https://fonts.googleapis.com/css2?family=Almarai:wght@300;400;700;800&display=swap" rel="stylesheet">
    <style>
        @page {
            margin: 0;
            size: A4;
        }
        * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            box-sizing: border-box;
        }
        body {
            font-family: 'Almarai', sans-serif;
            margin: 0;
            padding: 0;
            color: #1b2a4a;
            background: #ffffff;
            line-height: 1.4;
        }
        .page-container {
            padding: 40px 50px;
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            position: relative;
            background: white;
            overflow: hidden;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding-bottom: 30px;
            border-bottom: 2px solid rgba(212, 168, 83, 0.15);
            margin-bottom: 35px;
            position: relative;
            z-index: 10;
        }
        .branding {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        .logo-text {
            font-size: 42px;
            font-weight: 900;
            background: linear-gradient(135deg, #1b2a4a 0%, #d4a853 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            letter-spacing: -1.5px;
            margin: 0;
        }
        .company-info {
            font-size: 11px;
            font-weight: 700;
            color: #6b7280;
            border-right: 3px solid #d4a853;
            padding-right: 12px;
            margin-top: 8px;
        }
        .invoice-badge-container {
            text-align: left;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 12px;
        }
        .invoice-badge {
            background: #1b2a4a;
            color: #ffffff;
            padding: 12px 25px;
            border-radius: 12px;
            font-weight: 800;
            font-size: 18px;
            box-shadow: 0 10px 15px -3px rgba(27, 42, 74, 0.1);
            border-bottom: 4px solid #d4a853;
        }
        .invoice-meta {
            background: #f9fafb;
            padding: 12px 20px;
            border-radius: 12px;
            border: 1px solid rgba(27, 42, 74, 0.05);
            font-size: 11px;
            font-weight: 700;
            display: flex;
            flex-direction: column;
            gap: 4px;
            min-width: 220px;
        }
        .invoice-meta p { margin: 0; display: flex; justify-content: space-between; }
        .invoice-meta span { color: #d4a853; font-family: sans-serif; }

        .client-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 35px;
        }
        .card {
            padding: 20px;
            border-radius: 20px;
            background: #f9fafb;
            border: 1px solid rgba(27, 42, 74, 0.05);
        }
        .card.dark { background: #1b2a4a; color: white; border: none; }
        .card h3 {
            margin-top: 0;
            font-size: 12px;
            color: #d4a853;
            text-transform: uppercase;
            margin-bottom: 12px;
            font-weight: 800;
        }
        .card p { margin: 3px 0; font-weight: 700; font-size: 14px; }
        .card .name { font-size: 18px; font-weight: 800; margin-bottom: 8px; }

        table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            margin-bottom: 35px;
        }
        th {
            background: #1b2a4a;
            color: #ffffff;
            padding: 15px;
            text-align: right;
            font-size: 12px;
            font-weight: 800;
        }
        th:first-child { border-radius: 0 15px 15px 0; }
        th:last-child { border-radius: 15px 0 0 15px; }
        td {
            padding: 15px;
            border-bottom: 1px solid rgba(27, 42, 74, 0.05);
            font-size: 13px;
            font-weight: 700;
        }
        .price-col { font-family: sans-serif; text-align: center; }

        .summary-container {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            gap: 40px;
        }
        .qr-placeholder {
            width: 100px;
            height: 100px;
            background: white;
            border: 1px solid rgba(27, 42, 74, 0.1);
            border-radius: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 8px;
            color: #9ca3af;
            text-align: center;
            padding: 10px;
        }
        .total-card {
            width: 350px;
            background: #1b2a4a;
            color: #ffffff;
            padding: 25px;
            border-radius: 24px;
        }
        .total-line {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 12px;
            opacity: 0.8;
        }
        .total-line.vat { color: #d4a853; opacity: 1; font-weight: 800; }
        .total-line.grand {
            font-size: 24px;
            font-weight: 900;
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid rgba(255,255,255,0.1);
            opacity: 1;
        }
        .total-line.grand span:last-child { font-family: sans-serif; }

        .footer {
            margin-top: 50px;
            text-align: center;
            padding-top: 25px;
            border-top: 1px solid rgba(212, 168, 83, 0.1);
        }
        .footer p { margin: 5px 0; font-size: 11px; color: #9ca3af; font-weight: 700; }
        .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-35deg);
            font-size: 100px;
            font-weight: 900;
            color: rgba(27, 42, 74, 0.02);
            white-space: nowrap;
            z-index: 1;
            pointer-events: none;
        }
    </style>
</head>
<body>
    <div class="page-container">
        <div class="watermark">MJM STORE MJM STORE</div>
        
        <div class="header">
            <div class="branding">
                <h1 class="logo-text">MJM STORE</h1>
                <div class="company-info">
                    شركة مجم للتجارة والمقاولات<br>
                    الرقم الضريبي: 310555544400003<br>
                    المملكة العربية السعودية، الرياض
                </div>
            </div>
            <div class="invoice-badge-container">
                <div class="invoice-badge">فاتورة ضريبية مبسطة</div>
                <div class="invoice-meta">
                    <p>رقم الفاتورة: <span>${invoiceNumber}</span></p>
                    <p>التاريخ: <span>${new Date(createdAt).toLocaleDateString('ar-SA')}</span></p>
                    <p>رقم الطلب: <span>#MJM-${order.id}</span></p>
                </div>
            </div>
        </div>

        <div class="client-grid">
            <div class="card">
                <h3>العميل المستلم</h3>
                <p class="name">${customer?.name ?? 'عميل MJM'}</p>
                <p>${customer?.phone ?? ''}</p>
                <p style="color: #6b7280; font-weight: 400;">${customer?.email || '-'}</p>
            </div>
            <div class="card dark">
                <h3>معلومات الدفع</h3>
                <p>وسيلة السداد: ${paymentMethod}</p>
                <p>حالة الدفع: تم السداد</p>
                <div style="margin-top: 10px; font-size: 10px; color: #d4a853; font-weight: 800; letter-spacing: 1px;">PAID SECURELY</div>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th style="width: 45%;">المنتج</th>
                    <th style="text-align: center; width: 15%;">الكمية</th>
                    <th style="text-align: center; width: 20%;">السعر</th>
                    <th style="text-align: center; width: 20%;">الإجمالي</th>
                </tr>
            </thead>
            <tbody>
                ${items
                  .map(
                    (item: InvoiceTemplateItem) => `
                    <tr>
                        <td>${item.product?.name || item.bundle?.name}</td>
                        <td style="text-align: center; font-family: sans-serif;">${item.quantity}</td>
                        <td class="price-col">${Number(item.unitPrice).toFixed(2)} ر.س</td>
                        <td class="price-col" style="color: #d4a853;">${(Number(item.unitPrice) * item.quantity).toFixed(2)} ر.س</td>
                    </tr>
                `,
                  )
                  .join('')}
                <tr style="background: rgba(212, 168, 83, 0.02);">
                    <td colspan="3" style="font-weight: 800; color: #6b7280;">رسوم الشحن والتجهيز</td>
                    <td class="price-col" style="font-weight: 800;">${Number(shippingFee).toFixed(2)} ر.س</td>
                </tr>
            </tbody>
        </table>

        <div class="summary-container">
            <div class="qr-placeholder">
                E-INVOICE QR CODE<br>MJM STORE<br>TAX ID Verified
            </div>
            <div class="total-card">
                <div class="total-line">
                    <span>المجموع قبل الضريبة</span>
                    <span>${subTotal.toFixed(2)} ر.س</span>
                </div>
                <div class="total-line vat">
                    <span>ضريبة القيمة المضافة (15%)</span>
                    <span>${Number(vatAmount).toFixed(2)} ر.س</span>
                </div>
                <div class="total-line grand">
                    <span>الإجمالي النهائي</span>
                    <span>${Number(totalAmount).toFixed(2)} ر.س</span>
                </div>
            </div>
        </div>

        <div class="footer">
            <p style="font-style: italic; color: #1b2a4a; font-size: 14px;">شكراً لثقتكم بمتجر MJM STORE</p>
            <p>تخضع هذه الفاتورة لأنظمة هيئة الزكاة والضريبة والجمارك بالمملكة العربية السعودية</p>
        </div>
    </div>
</body>
</html>
    `;
};
