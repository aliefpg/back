const { dateConvert, rupiahConvert } = require("../../helpers");
const moment = require("moment");
moment.locale('id')
module.exports = {
  tableHtmlRincianPembayaran: function (data, index, datas) {
    return `<tr>
        <td>${index + 1}</td>
        <td>${data.pos_pay_name} T.A ${datas.period_start}/${datas.period_end}${data.month_name
        ? `(${data.month_name} ${parseInt(data.month_month_id) - 6 <= 0
          ? `${datas.period_start}`
          : `${datas.period_end}`
        })`
        : " (bebas)"
      }</td>
        <td>${data.payment_rate_date_pay
        ? dateConvert(data.payment_rate_date_pay)
        : "-"
      }</td>
        <td>${rupiahConvert(
        data.payment_rate_status == 0
          ? data.payment_rate_total_pay || data.payment_rate_bill
          : "-"
      )}</td>
        <td>${data.payment_rate_status == 1 ? "Lunas" : "Belum Lunas"}</td>
        <td>${data.payment_type == "BULANAN"
        ? data.payment_rate_via_name || "-"
        : "-"
      }</td>
    </tr>`;
  },
  tableTagihanPembayaran: (data, index, datas) => `  <tr>
  <td>${index + 1}</td>
  <td>${data.pos_pay_name} T.A ${data.period_start}/${data.period_end}${data.month_name ? `(${data.month_name})` : " (bebas)"
    }</td>
  <td>${rupiahConvert(parseInt(data.payment_rate_bill, 10))}</td>

</tr>`,
  tableKasKredit: (data, index) => `  <tr>
  <td>${index + 1}</td>
  <td>${data.account_cost_account_code}-${data.account_cost_account_desc}</td>
  <td>${data.kredit_information}
</td>
  <td>${rupiahConvert(parseInt(data.kredit_value, 10))}</td>

</tr>`,
  tableKasDebit: (data, index) => `  <tr>
  <td>${index + 1}</td>
  <td>${data.account_cost_account_code}-${data.account_cost_account_desc}</td>
  <td>${data.debit_information}
  </td>
  <td>${rupiahConvert(parseInt(data.debit_value, 10))}</td>

</tr>`,
  tableKwitansiPembayaran: (data, index, datas) => `  <tr>
  <td>${index + 1}</td>
  <td>${data.pos_pay_name} T.A ${data.period_start}/${data.period_end}${data.month_name ? `(${data.month_name})` : " (bebas)"
    }</td>
  <td>${rupiahConvert(
      parseInt(
        (data.month_month_id
          ? data.payment_rate_bill
          : data.payment_rate_bill - data.payment_rate_discount) ?? 0,
        10
      )
    )}</td>
  <td>${rupiahConvert(
      parseInt(
        (data.payment_rate_bebas_pay_bill || data.payment_rate_bill) ?? 0,
        10
      )
    )}</td>
  <td>${rupiahConvert(
      parseInt(data.payment_rate_bebas_pay_remaining ?? 0, 10)
    )}</td>

</tr>`,
  tableLaporanPerKelas: (data, index, datas) => `  <tr>
  <td style="font-size: 11px;">${index + 1}</td>
  <td style="font-size: 11px;">${data.student_nis}</td>
  <td style="font-size: 11px;">${data.student_full_name}</td>
  <td style="font-size: 11px;">${rupiahConvert(data.total_tagihan)}</td>
  <td style="font-size: 11px;">${rupiahConvert(data.sudah_dibayar)}</td>
  <td style="font-size: 11px;">${rupiahConvert(data.sisa_tagihan)}</td>
  <td style="font-size: 11px;">${data.sisa_tagihan == 0 ? 'Lunas' : 'Belum Lunas'}</td>
</tr>`,
  headerTableLaporanPerTanggal: (title) => `
  <h3>${title}</h3>

 <table style="border: none;">
            <thead>
                <th style="font-size: 12px;">NO.</th>
                <th style="font-size: 12px;">TANGGAL</th>
                <th style="font-size: 12px;">NIS</th>
                <th style="font-size: 12px;">NAMA SISWA</th>
                <th style="font-size: 12px;">NOMINAL</th>
                <th style="font-size: 12px;">KETERANGAN</th>
            </thead>
    <tbody>
           
       `,
  tableLaporanPerTanggal: (index, data, datas) => `
    <tr>
    <td style="font-size: 11px;">${index + 1}</td>
    <td style="font-size: 11px;">${data.payment_rate_date_pay
      ? moment(data.payment_rate_date_pay).format('YYYY-MM-DD')
      : moment(data.payment_rate_bebas_pay_created_at).format(
        'YYYY-MM-DD'
      )}</td>
    <td style="font-size: 11px;">${data.student_nis}</td>
    <td style="font-size: 11px;">${data.student_full_name}</td>
    <td style="font-size: 11px;">${rupiahConvert(data.payment_rate_bebas_pay_bill ||
        parseInt(data.payment_rate_bill, 10))}</td>
    <td style="font-size: 11px;">${data.payment_rate_bebas_pay_desc ?? data.month_name}</td>
  </tr>
   
`,
  tableLaporanKas: (index, data, datas) => `
    <tr>
    <td style="font-size: 11px;">${index + 1}</td>
    <td style="font-size: 11px;">${data.account_code}</td>
    <td style="font-size: 11px;">${data.account_description} ${data.period_start?`T.A ${data.period_start}/${data.period_end}`:''}</td>
    <td style="font-size: 11px;">${rupiahConvert(parseInt(data?.total, 10) || '-')}</td>
    <td style="font-size: 11px;">${rupiahConvert(parseInt(data?.total_keluar, 10) || '-')}</td>
    
  </tr>
   
`,
  tableLaporanKasPerAnggaran: (index, data, totalVar, title) => {
    let tableHtml = `<p>${title}</p>
    <table style="border: none;">
      <thead>
        <th style="font-size: 12px;">NO.</th>
        <th style="font-size: 12px;">Tanggal</th>
        <th style="font-size: 12px;">KETERANGAN</th>
        <th style="font-size: 12px;">NIS</th>
        <th style="font-size: 12px;">NAMA</th>
        <th style="font-size: 12px;">KELAS</th>
        <th style="font-size: 12px;">PENERIMAAN</th>
        <th style="font-size: 12px;">PENGELUARAN</th>
      </thead>
      <tbody>`;

    data?.data.forEach((item, idx) => {
      tableHtml += `
      <tr>
        <td style="font-size: 11px;">${index + idx + 1}</td>
        <td style="font-size: 11px;">${moment(item.date_pay).format('DD-MM-YYYY')}</td>
        <td style="font-size: 11px;">${data.account_description ||'-'} ${data.period_start?`T.A ${data.period_start}/${data.period_end}`:''}</td>

        <td style="font-size: 11px;">${item.student_nis || '-'}</td>
        <td style="font-size: 11px;">${item.student_full_name || '-'}</td>
        <td style="font-size: 11px;">${item.class_name || '-'}</td>
        <td style="font-size: 11px;">${rupiahConvert(parseInt(item.total, 10) || '-')}</td>
        <td style="font-size: 11px;">${rupiahConvert(parseInt(item.total_keluar, 10) || '-')}</td>
      </tr>`;
    });

    tableHtml += `
      </tbody>
    </table>`;
    tableHtml += `
    <div style="width: 100%; align-self: flex-end; margin-top: 1rem;background-color: lightgray;">
    <div style="display: flex;">
        <p style="flex: 1;"><strong>TOTAL</strong></p>
        <p style="flex:1;"><strong>${rupiahConvert(parseInt(data[`${totalVar}`] || 0, 10))}</strong></p>

    </div>

</div>`;

    return tableHtml;
  },
  tableLaporanJurnalPerAnggaran: (index, data, totalVar, title) => {
    let tableHtml = `<p>${title}</p>
    <table style="border: none;">
      <thead>
        <th style="font-size: 12px;">AKUN</th>
        <th style="font-size: 12px;">Tanggal</th>
        <th style="font-size: 12px;">KODE AKUN</th>
        <th style="font-size: 12px;">KETERANGAN</th>
        <th style="font-size: 12px;">NIS</th>
        <th style="font-size: 12px;">NAMA</th>
        <th style="font-size: 12px;">KELAS</th>
        <th style="font-size: 12px;">PENERIMAAN</th>
        <th style="font-size: 12px;">PENGELUARAN</th>
      </thead>
      <tbody>`;

    data?.data.forEach((item, idx) => {
      tableHtml += `
      <tr>
        <td style="font-size: 11px;">${item.account_cost_account_code || '-'}</td>
        <td style="font-size: 11px;">${moment(item.date_pay).format('DD-MM-YYYY')}</td>
        <td style="font-size: 11px;">${item.account_cost_account_description || '-'}</td>
        <td style="font-size: 11px;">${data.account_description ||'-'} ${data.period_start?`T.A ${data.period_start}/${data.period_end}`:''}</td>

        <td style="font-size: 11px;">${item.student_nis || '-'}</td>
        <td style="font-size: 11px;">${item.student_full_name || '-'}</td>
        <td style="font-size: 11px;">${item.class_name || '-'}</td>
        <td style="font-size: 11px;">${rupiahConvert(parseInt(item.total, 10) || '-')}</td>
        <td style="font-size: 11px;">${rupiahConvert(parseInt(item.total_keluar, 10) || '-')}</td>
      </tr>`;
    });

    tableHtml += `
      </tbody>
    </table>`;
    tableHtml += `
    <div style="width: 100%; align-self: flex-end; margin-top: 1rem;background-color: lightgray;">
    <div style="display: flex;">
        <p style="flex: 1;"><strong>TOTAL</strong></p>
        <p style="flex:1;"><strong>${rupiahConvert(parseInt(data[`${totalVar}`] || 0, 10))}</strong></p>

    </div>

</div>`;

    return tableHtml;
  },

  tableLaporanJurnalUmum: (index, data, datas) => `
    <tr>
    <td style="font-size: 11px;">${data.account_cost_account_description ?? '-'}</td>
    <td style="font-size: 11px;">${moment(data.date_pay).format('DD-MM-YYYY')}</td>
    <td style="font-size: 11px;">${data.account_cost_account_code??'-'}</td>
    <td style="font-size: 11px;">${data.account_description ||'-'} ${data.period_start?`T.A ${data.period_start}/${data.period_end}`:''}</td>

    <td style="font-size: 11px;">${rupiahConvert(parseInt(data?.total, 10) || '-')}</td>
    <td style="font-size: 11px;">${rupiahConvert(parseInt(data?.total_keluar, 10) || '-')}</td>
  </tr>
   
`,
  footerTableLaporanPerTanggal: (datas) => `
  </tbody>
  </table>
  <div style="width: 100%; align-self: flex-end; margin-top: 1rem;margin-bottom:2rem;background-color: lightgray;">
      <div style="display: flex;">
          <p style="flex: 1;"><strong>TOTAL PEMBAYARAN SISWA</strong></p>
          <p style="flex:1;"><strong>${rupiahConvert(parseInt(datas.total, 10))}</strong></p>
      </div>
  </div>
   
`,
};
