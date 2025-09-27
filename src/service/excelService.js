/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable max-len */
/* eslint-disable no-undef */
/* eslint-disable no-plusplus */
/* eslint-disable no-param-reassign */
const XLSX = require("xlsx-js-style");
const moment = require("moment");
const helpers = require("../helpers");

module.exports = {
  generateExcelLaporanKasKeuangan: (newResult) => {
    const jsonDataDebit = newResult.data_payment
      .filter(
        (item) =>
          item?.account_cost_account_code?.includes("4-4") ||
          item?.account_code?.includes("4-4")
      )
      .map((data, index) => ({
        No: index + 1,
        "Kode Akun": data.account_code,
        Ketarangan:
          `${data.account_description} ${
            data.period_start
              ? `T.A ${data.period_start}/${data.period_end}`
              : ""
          }` || "-",
        Debit: helpers.rupiahConvert(parseInt(data?.total, 10) || "-"),
        Kredit: helpers.rupiahConvert(parseInt(data?.total_keluar, 10) || "-"),
      }));
    const jsonDataKredit = newResult.data_payment
      .filter(
        (item) =>
          item?.account_cost_account_code?.includes("5-5)") ||
          item?.account_code?.includes("5-5")
      )
      .map((data, index) => ({
        No: index + 1,
        "Kode Akun": data.account_code,
        Ketarangan:
          `${data.account_description} ${
            data.period_start
              ? `T.A ${data.period_start}/${data.period_end}`
              : ""
          }` || "-",
        Debit: helpers.rupiahConvert(parseInt(data?.total, 10) || "-"),
        Kredit: helpers.rupiahConvert(parseInt(data?.total_keluar, 10) || "-"),
      }));

    const ws = XLSX.utils.json_to_sheet(jsonDataDebit, { origin: "A12" });

    // Add title in the first row

    // Create a new workbook and append the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "sheet 1");

    // Add title in the first row
    // STEP 2: Create data rows and styles

    XLSX.utils.sheet_add_aoa(
      ws,
      [
        [
          {
            v: newResult.unit_name,
            t: "s",
            s: { font: { bold: true, color: "black", sz: 16 } },
          },
        ],
      ],
      {
        origin: "A1",
      }
    );

    XLSX.utils.sheet_add_aoa(
      ws,
      [
        [
          {
            v: newResult.unit_address,
            t: "s",
            s: { font: { bold: true, color: "black", sz: 13 } },
          },
        ],
      ],
      {
        origin: "A2",
      }
    );
    XLSX.utils.sheet_add_aoa(
      ws,
      [
        [
          {
            v: newResult.title,
            t: "s",
            s: { font: { bold: true, color: "black", sz: 12 } },
          },
        ],
      ],
      {
        origin: "C5",
      }
    );

    XLSX.utils.sheet_add_aoa(
      ws,
      [
        [
          {
            v: "Unit",
            t: "s",
            s: { font: { bold: true, color: "black", sz: 12 } },
          },
        ],
      ],
      {
        origin: "A7",
      }
    );
    XLSX.utils.sheet_add_aoa(
      ws,
      [
        [
          {
            v: newResult.unit,
            t: "s",
            s: { font: { bold: false, color: "black", sz: 12 } },
          },
        ],
      ],
      {
        origin: "B7",
      }
    );
    XLSX.utils.sheet_add_aoa(
      ws,
      [
        [
          {
            v: "Penerimaan",
            t: "s",
            s: { font: { bold: false, color: "black", sz: 13 } },
          },
        ],
      ],
      {
        origin: "A10",
      }
    );
    const addBorder = (cell) => {
      if (!cell.s) {
        cell.s = {};
      }
      cell.s.border = {
        top: { style: "medium", color: { auto: 1 } },
        bottom: { style: "medium", color: { auto: 1 } },
        left: { style: "medium", color: { auto: 1 } },
        right: { style: "medium", color: { auto: 1 } },
      };
    };
    const range = XLSX.utils.decode_range(ws["!ref"]);

    // Apply borders to each cell in the range, excluding the title row
    for (let R = 10; R <= range.e.r; ++R) {
      // Start from row 3 (index 2)
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = ws[cellAddress];
        if (cell) addBorder(cell);
      }
    }

    const lastRow = range.e.r + 1; // Next row after the table
    XLSX.utils.sheet_add_aoa(
      ws,
      [
        [
          {
            v: "Total",
            t: "s",
            s: { font: { bold: true, color: "black", sz: 16 } },
          },
        ],
      ],
      {
        origin: `A${lastRow + 1}`,
      }
    );
    XLSX.utils.sheet_add_aoa(
      ws,
      [
        [
          {
            v: helpers.rupiahConvert(newResult.sub_total_masuk),
            t: "s",
            s: { font: { bold: true, color: "black", sz: 16 } },
          },
        ],
      ],
      {
        origin: `D${lastRow + 1}`,
      }
    );

    XLSX.utils.sheet_add_aoa(
      ws,
      [
        [
          {
            v: "Pengeluaran",
            t: "s",
            s: { font: { bold: false, color: "black", sz: 15 } },
          },
        ],
      ],
      {
        origin: `A${lastRow + 3}`,
      }
    );

    XLSX.utils.sheet_add_json(ws, jsonDataKredit, {
      origin: `A${lastRow + 5}`,
    });

    const addBorder2 = (cell) => {
      if (!cell.s) {
        cell.s = {};
      }
      cell.s.border = {
        top: { style: "medium", color: { auto: 1 } },
        bottom: { style: "medium", color: { auto: 1 } },
        left: { style: "medium", color: { auto: 1 } },
        right: { style: "medium", color: { auto: 1 } },
      };
    };

    const range2 = XLSX.utils.decode_range(ws["!ref"]);
    const lastRow2 = range2.e.r + 1; // Next row after the table

    // Apply borders to each cell in the range, excluding the title row
    for (let R = lastRow + 3; R <= lastRow2; ++R) {
      // Start from row 3 (index 2)
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = ws[cellAddress];
        if (cell) addBorder2(cell);
      }
    }

    XLSX.utils.sheet_add_aoa(
      ws,
      [
        [
          {
            v: "Total",
            t: "s",
            s: { font: { bold: true, color: "black", sz: 16 } },
          },
        ],
      ],
      {
        origin: `A${lastRow2 + 1}`,
      }
    );
    XLSX.utils.sheet_add_aoa(
      ws,
      [
        [
          {
            v: helpers.rupiahConvert(newResult.sub_total_keluar),
            t: "s",
            s: { font: { bold: true, color: "black", sz: 16 } },
          },
        ],
      ],
      {
        origin: `D${lastRow2 + 1}`,
      }
    );

    XLSX.utils.sheet_add_aoa(
      ws,
      [
        [
          {
            v: "Debit",
            t: "s",
            s: { font: { bold: true, color: "black", sz: 12 } },
          },
        ],
      ],
      {
        origin: `E${lastRow2 + 2}`,
      }
    );
    XLSX.utils.sheet_add_aoa(
      ws,
      [
        [
          {
            v: "Kredit",
            t: "s",
            s: { font: { bold: true, color: "black", sz: 12 } },
          },
        ],
      ],
      {
        origin: `F${lastRow2 + 2}`,
      }
    );
    XLSX.utils.sheet_add_aoa(
      ws,
      [
        [
          {
            v: "SubTotal",
            t: "s",
            s: { font: { bold: true, color: "black", sz: 12 } },
          },
        ],
      ],
      {
        origin: `D${lastRow2 + 3}`,
      }
    );
    XLSX.utils.sheet_add_aoa(
      ws,
      [
        [
          {
            v: helpers.rupiahConvert(newResult.sub_total_masuk),
            t: "s",
            s: { font: { bold: false, color: "black", sz: 12 } },
          },
        ],
      ],
      {
        origin: `E${lastRow2 + 3}`,
      }
    );
    XLSX.utils.sheet_add_aoa(
      ws,
      [
        [
          {
            v: helpers.rupiahConvert(newResult.sub_total_keluar),
            t: "s",
            s: { font: { bold: false, color: "black", sz: 12 } },
          },
        ],
      ],
      {
        origin: `F${lastRow2 + 3}`,
      }
    );
    XLSX.utils.sheet_add_aoa(
      ws,
      [
        [
          {
            v: "Saldo Awal",
            t: "s",
            s: { font: { bold: true, color: "black", sz: 12 } },
          },
        ],
      ],
      {
        origin: `D${lastRow2 + 4}`,
      }
    );
    XLSX.utils.sheet_add_aoa(
      ws,
      [
        [
          {
            v: helpers.rupiahConvert(newResult.saldo_awal_debit),
            t: "s",
            s: { font: { bold: false, color: "black", sz: 12 } },
          },
        ],
      ],
      {
        origin: `E${lastRow2 + 4}`,
      }
    );
    XLSX.utils.sheet_add_aoa(
      ws,
      [
        [
          {
            v: helpers.rupiahConvert(newResult.saldo_awal_kredit),
            t: "s",
            s: { font: { bold: false, color: "black", sz: 12 } },
          },
        ],
      ],
      {
        origin: `F${lastRow2 + 4}`,
      }
    );
    XLSX.utils.sheet_add_aoa(
      ws,
      [
        [
          {
            v: "Total",
            t: "s",
            s: { font: { bold: true, color: "black", sz: 12 } },
          },
        ],
      ],
      {
        origin: `D${lastRow2 + 5}`,
      }
    );
    XLSX.utils.sheet_add_aoa(
      ws,
      [
        [
          {
            v: helpers.rupiahConvert(newResult.total_masuk),
            t: "s",
            s: { font: { bold: false, color: "black", sz: 12 } },
          },
        ],
      ],
      {
        origin: `E${lastRow2 + 5}`,
      }
    );
    XLSX.utils.sheet_add_aoa(
      ws,
      [
        [
          {
            v: helpers.rupiahConvert(newResult.total_keluar),
            t: "s",
            s: { font: { bold: false, color: "black", sz: 12 } },
          },
        ],
      ],
      {
        origin: `F${lastRow2 + 5}`,
      }
    );
    XLSX.utils.sheet_add_aoa(
      ws,
      [
        [
          {
            v: "Saldo Akhir",
            t: "s",
            s: { font: { bold: true, color: "black", sz: 12 } },
          },
        ],
      ],
      {
        origin: `D${lastRow2 + 6}`,
      }
    );
    XLSX.utils.sheet_add_aoa(
      ws,
      [
        [
          {
            v: helpers.rupiahConvert(newResult.saldo_akhir),
            t: "s",
            s: { font: { bold: false, color: "black", sz: 12 } },
          },
        ],
      ],
      {
        origin: `E${lastRow2 + 6}`,
      }
    );
    XLSX.utils.sheet_add_aoa(
      ws,
      [
        [
          {
            v: "-",
            t: "s",
            s: { font: { bold: false, color: "black", sz: 12 } },
          },
        ],
      ],
      {
        origin: `F${lastRow2 + 6}`,
      }
    );

    XLSX.utils.sheet_add_aoa(
      ws,
      [
        [
          {
            v: `${newResult.unit_kota}, ${moment()
              .locale("id")
              .format("DD MMMM YYYY")}`,
            t: "s",
            s: {
              font: {
                bold: true,
                color: "black",
                sz: 12,
                fill: {
                  fgColor: { rgb: "FFFFAA00" },
                },
              },
            },
          },
        ],
      ],
      { origin: `F${lastRow2 + 9}` } // Footer starts after the last row
    );
    XLSX.utils.sheet_add_aoa(
      ws,
      [
        [
          {
            v: newResult.unit_person,
            t: "s",
            s: {
              font: {
                bold: true,
                color: "black",
                sz: 12,
                fill: {
                  fgColor: { rgb: "FFFFAA00" },
                },
              },
            },
          },
        ],
      ],
      { origin: `F${lastRow2 + 10}` } // Footer starts after the last row
    );

    XLSX.utils.sheet_add_aoa(
      ws,
      [
        [
          {
            v: newResult.unit_person_name,
            t: "s",
            s: {
              font: {
                bold: true,
                color: "black",
                sz: 12,
                fill: {
                  fgColor: { rgb: "FFFFAA00" },
                },
              },
            },
          },
        ],
      ],
      { origin: `F${lastRow2 + 12}` } // Footer starts after the last row
    );
    // Generate the Excel file and send it as a response
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    return buffer;
  },
  generateExcelLaporanPembayaranPerTanggal: (newResult) => {
    const ws = XLSX.utils.json_to_sheet([], { origin: "A1" }); // Create a blank sheet

    const addBorder = (cell) => {
      if (!cell.s) {
        cell.s = {};
      }
      cell.s.border = {
        top: { style: "medium", color: { auto: 1 } },
        bottom: { style: "medium", color: { auto: 1 } },
        left: { style: "medium", color: { auto: 1 } },
        right: { style: "medium", color: { auto: 1 } },
      };
    };
    XLSX.utils.sheet_add_aoa(
      ws,
      [
        [
          {
            v: newResult.unit_name,
            t: "s",
            s: { font: { bold: true, color: "black", sz: 16 } },
          },
        ],
      ],
      {
        origin: "A1",
      }
    );

    XLSX.utils.sheet_add_aoa(
      ws,
      [
        [
          {
            v: newResult.unit_address,
            t: "s",
            s: { font: { bold: true, color: "black", sz: 13 } },
          },
        ],
      ],
      {
        origin: "A2",
      }
    );
    XLSX.utils.sheet_add_aoa(
      ws,
      [
        [
          {
            v: newResult.title,
            t: "s",
            s: { font: { bold: true, color: "black", sz: 15 } },
          },
        ],
      ],
      {
        origin: "C5",
      }
    );
    XLSX.utils.sheet_add_aoa(
      ws,
      [
        [
          {
            v: "Tahun Ajaran",
            t: "s",
            s: { font: { bold: true, color: "black", sz: 12 } },
          },
        ],
      ],
      {
        origin: "A7",
      }
    );
    XLSX.utils.sheet_add_aoa(
      ws,
      [
        [
          {
            v: newResult.tahun_ajaran,
            t: "s",
            s: { font: { bold: false, color: "black", sz: 12 } },
          },
        ],
      ],
      {
        origin: "B7",
      }
    );
    XLSX.utils.sheet_add_aoa(
      ws,
      [
        [
          {
            v: "Kelas",
            t: "s",
            s: { font: { bold: true, color: "black", sz: 12 } },
          },
        ],
      ],
      {
        origin: "A8",
      }
    );
    XLSX.utils.sheet_add_aoa(
      ws,
      [
        [
          {
            v: newResult.class,
            t: "s",
            s: { font: { bold: false, color: "black", sz: 12 } },
          },
        ],
      ],
      {
        origin: "B8",
      }
    );
    let currentRow = 9; // Start from the first row
    newResult.payment_type.forEach((data, i) => {
      // Add title

      // Add unit and other details
      XLSX.utils.sheet_add_aoa(
        ws,
        [
          [
            {
              v: `${data.pos_pay_name} T.A ${data.period_start}/${data.period_end}`,
              t: "s",
              s: { font: { bold: true, color: "black", sz: 12 } },
            },
          ],
        ],
        {
          origin: `A${currentRow + 2}`,
        }
      );

      const jsonData = data.payment?.map((item, index) => ({
        No: index + 1,
        Tanggal: item.payment_rate_date_pay
          ? moment(item.payment_rate_date_pay).format("YYYY-MM-DD")
          : moment(item.payment_rate_bebas_pay_created_at).format("YYYY-MM-DD"),
        NIS: item.student_nis,
        Nama: item.student_full_name,
        Nominal: helpers.rupiahConvert(
          item.payment_rate_bebas_pay_bill ||
            parseInt(item.payment_rate_bill, 10)
        ),
        Keterangan: item.payment_rate_bebas_pay_desc ?? item.month_name,
      }));
      // Add the table data (e.g., jsonDataDebit)
      XLSX.utils.sheet_add_json(ws, jsonData, {
        origin: `A${currentRow + 4}`,
      });

      // Apply borders to the table data
      const range = XLSX.utils.decode_range(ws["!ref"]);
      for (let R = currentRow + 7; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
          const cell = ws[cellAddress];
          if (cell) addBorder(cell);
        }
      }
      XLSX.utils.sheet_add_aoa(
        ws,
        [
          [
            {
              v: "Total Pembayaran Siswa",
              t: "s",
              s: {
                font: {
                  bold: true,
                  color: "black",
                  sz: 12,
                  fill: {
                    fgColor: { rgb: "FFFFAA00" },
                  },
                },
              },
            },
          ],
        ],
        { origin: `A${range.e.r + 2}` } // Footer starts after the last row
      );

      XLSX.utils.sheet_add_aoa(
        ws,
        [
          [
            {
              v: helpers.rupiahConvert(parseInt(data.total, 10) || 0),
              t: "s",
              s: {
                font: {
                  bold: true,
                  color: "black",
                  sz: 12,
                  fill: {
                    fgColor: { rgb: "FFFFAA00" },
                  },
                },
              },
            },
          ],
        ],
        { origin: `E${range.e.r + 2}` } // Footer starts after the last row
      );
      currentRow = range.e.r + 10; // Move to the next row, leaving space between tables
    });
    // Create the workbook and append the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "sheet 1");
    XLSX.utils.sheet_add_aoa(
      ws,
      [
        [
          {
            v: `${newResult.unit_kota}, ${moment()
              .locale("id")
              .format("DD MMMM YYYY")}`,
            t: "s",
            s: {
              font: {
                bold: true,
                color: "black",
                sz: 12,
                fill: {
                  fgColor: { rgb: "FFFFAA00" },
                },
              },
            },
          },
        ],
      ],
      { origin: `F${currentRow + 9}` } // Footer starts after the last row
    );
    XLSX.utils.sheet_add_aoa(
      ws,
      [
        [
          {
            v: newResult.unit_person,
            t: "s",
            s: {
              font: {
                bold: true,
                color: "black",
                sz: 12,
                fill: {
                  fgColor: { rgb: "FFFFAA00" },
                },
              },
            },
          },
        ],
      ],
      { origin: `F${currentRow + 10}` } // Footer starts after the last row
    );

    XLSX.utils.sheet_add_aoa(
      ws,
      [
        [
          {
            v: newResult.unit_person_name,
            t: "s",
            s: {
              font: {
                bold: true,
                color: "black",
                sz: 12,
                fill: {
                  fgColor: { rgb: "FFFFAA00" },
                },
              },
            },
          },
        ],
      ],
      { origin: `F${currentRow + 12}` } // Footer starts after the last row
    );
    // Generate the Excel file and send it as a response
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    return buffer;
  },
  generateExcelLaporanRekapPembayaran: (newResult) => {
    const ws = XLSX.utils.json_to_sheet([], { origin: "A1" }); // Create a blank sheet

    const addBorder = (cell) => {
      if (!cell.s) {
        cell.s = {};
      }
      cell.s.border = {
        top: { style: "medium", color: { auto: 1 } },
        bottom: { style: "medium", color: { auto: 1 } },
        left: { style: "medium", color: { auto: 1 } },
        right: { style: "medium", color: { auto: 1 } },
      };
    };
    XLSX.utils.sheet_add_aoa(
      ws,
      [
        [
          {
            v: newResult.unit_name,
            t: "s",
            s: { font: { bold: true, color: "black", sz: 16 } },
          },
        ],
      ],
      {
        origin: "A1",
      }
    );

    XLSX.utils.sheet_add_aoa(
      ws,
      [
        [
          {
            v: newResult.unit_address,
            t: "s",
            s: { font: { bold: true, color: "black", sz: 13 } },
          },
        ],
      ],
      {
        origin: "A2",
      }
    );
    XLSX.utils.sheet_add_aoa(
      ws,
      [
        [
          {
            v: newResult.title,
            t: "s",
            s: { font: { bold: true, color: "black", sz: 15 } },
          },
        ],
      ],
      {
        origin: "C5",
      }
    );
    XLSX.utils.sheet_add_aoa(
      ws,
      [
        [
          {
            v: "Tahun Ajaran",
            t: "s",
            s: { font: { bold: true, color: "black", sz: 12 } },
          },
        ],
      ],
      {
        origin: "A7",
      }
    );
    XLSX.utils.sheet_add_aoa(
      ws,
      [
        [
          {
            v: newResult.tahun_ajaran,
            t: "s",
            s: { font: { bold: false, color: "black", sz: 12 } },
          },
        ],
      ],
      {
        origin: "B7",
      }
    );
    XLSX.utils.sheet_add_aoa(
      ws,
      [
        [
          {
            v: "Kelas",
            t: "s",
            s: { font: { bold: true, color: "black", sz: 12 } },
          },
        ],
      ],
      {
        origin: "A8",
      }
    );
    XLSX.utils.sheet_add_aoa(
      ws,
      [
        [
          {
            v: newResult.class_name,
            t: "s",
            s: { font: { bold: false, color: "black", sz: 12 } },
          },
        ],
      ],
      {
        origin: "B8",
      }
    );
    let currentRow = 9; // Start from the first row
    const merges1 = [];

    // Add Headers
    XLSX.utils.sheet_add_aoa(
      ws,
      [
        [
          { v: "", t: "s", s: { font: { bold: true } } },
          { v: "", t: "s", s: { font: { bold: true } } },
          ...newResult.headers.map((header, index) => {
            // Check if 'monthly' is not null
            const cellValue =
              header?.detail?.monthly == null
                ? ""
                : `${header.pos_pay_name} ${header.period_start}/${header.period_end}`;

            // If monthly is not null, add a merge for the current header position
            if (header?.detail?.monthly != null) {
              merges1.push({
                s: { r: 0, c: index + 2 },
                e: { r: 0, c: index + 2 + (header.detail.monthly.length - 1) },
              }); // Adjust column range based on the index
            }

            return {
              v: cellValue,
              t: "s",
              s: { font: { bold: true }, alignment: { horizontal: "center" } },
            };
          }),
        ],
      ],
      { origin: "A1" }
    );
    ws["!merges"] = merges1;
    const rowSubHeader = [
      { v: "Kelas", t: "s", s: { font: { bold: true } } },
      { v: "Nama Siswa", t: "s", s: { font: { bold: true } } },
    ];
    const headers = newResult.headers.flatMap((header) => {
      if (header?.detail?.monthly == null) {
        return {
          v: `${header.pos_pay_name} - T.A ${header.period_start}/${header.period_end}`,
          t: "s",
          s: { font: { bold: true } },
        };
      }
      return header?.detail?.monthly.map((month) => ({
        v: `${month.month_name}`,
        t: "s",
        s: { font: { bold: true } },
      }));
    });

    rowSubHeader.push(...headers);

    XLSX.utils.sheet_add_aoa(ws, [rowSubHeader], { origin: "A2" });

    // Add Data Rows
    newResult.students.forEach((itemStudent, studentIndex) => {
      const row = [
        { v: itemStudent.class_class_name, t: "s" },
        { v: itemStudent.student_full_name, t: "s" },
      ];

      newResult.headers.forEach((header) => {
        if (header.detail?.monthly == null) {
          const payment = itemStudent.payment_type.find(
            (itemPayment) =>
              itemPayment.payment_id === header.payment_payment_id
          );
          const cellValue =
            payment?.payment_rate_bebas_pay_remaining === 0
              ? "Lunas"
              : helpers.rupiahConvert(
                  payment?.payment_rate_bebas_pay_remaining ?? "-"
                );
          row.push({ v: cellValue, t: "s" });
        } else {
          header.detail.monthly.forEach((month) => {
            const payment = itemStudent.payment_type.find(
              (itemPayment) =>
                itemPayment.payment_id === header.payment_payment_id &&
                itemPayment.month_id === month.month_id
            );
            const cellValue =
              payment?.payment_rate_status === 1
                ? "Lunas"
                : helpers.rupiahConvert(payment?.payment_rate_bill ?? "-");
            row.push({
              v: cellValue,
              t: "s",
              s: {
                color:
                  payment?.payment_rate_status === 1
                    ? { rgb: "00FF00" }
                    : { rgb: "FF0000" },
                font: { bold: true },
              },
            });
          });
        }
      });

      // Add row to worksheet
      XLSX.utils.sheet_add_aoa(ws, [row], { origin: `A${studentIndex + 3}` });
    });

    // Apply borders to all cells
    const range = XLSX.utils.decode_range(ws["!ref"]);
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cellAddress]) {
          // Initialize any missing cells with an empty string
          ws[cellAddress] = { v: "", t: "s" };
        }
        // Apply the border to all cells, whether they were initialized or not
        addBorder(ws[cellAddress]);
      }
    }

    currentRow = range.e.r + 10; // Move to the next row, leaving space between tables
    // Create the workbook and append the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "sheet 1");
    XLSX.utils.sheet_add_aoa(
      ws,
      [
        [
          {
            v: `${newResult.unit_kota}, ${moment()
              .locale("id")
              .format("DD MMMM YYYY")}`,
            t: "s",
            s: {
              font: {
                bold: true,
                color: "black",
                sz: 12,
                fill: {
                  fgColor: { rgb: "FFFFAA00" },
                },
              },
            },
          },
        ],
      ],
      { origin: `A${currentRow + 9}` } // Footer starts after the last row
    );
    XLSX.utils.sheet_add_aoa(
      ws,
      [
        [
          {
            v: newResult.unit_person,
            t: "s",
            s: {
              font: {
                bold: true,
                color: "black",
                sz: 12,
                fill: {
                  fgColor: { rgb: "FFFFAA00" },
                },
              },
            },
          },
        ],
      ],
      { origin: `A${currentRow + 10}` } // Footer starts after the last row
    );

    XLSX.utils.sheet_add_aoa(
      ws,
      [
        [
          {
            v: newResult.unit_person_name,
            t: "s",
            s: {
              font: {
                bold: true,
                color: "black",
                sz: 12,
                fill: {
                  fgColor: { rgb: "FFFFAA00" },
                },
              },
            },
          },
        ],
      ],
      { origin: `A${currentRow + 12}` } // Footer starts after the last row
    );
    // Generate the Excel file and send it as a response
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    return buffer;
  },
};
