// ระบบบันทึกการนิเทศ — Google Apps Script (ผูกกับ Google Sheets)
const SHEET_NAME = 'บันทึกนิเทศ';
const HEADERS = ['วันที่บันทึก', 'โรงเรียน', 'ครูผู้รับการนิเทศ', 'ประเด็นการนิเทศ', 'ผลการนิเทศ', 'ผู้บันทึก'];

function doGet(e) {
  // โหมด API: ?api=1&key=รหัสลับ  (ใช้กับเว็บ Next.js ในวันที่ 2)
  if (e && e.parameter && e.parameter.api) return api_(e);
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('ระบบบันทึกการนิเทศ')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(HEADERS);
  }
  return sh;
}

function saveRecord(data) {
  if (!data || !data.school || !data.topic) throw new Error('กรุณากรอกโรงเรียนและประเด็นการนิเทศ');
  const sh = getSheet_();
  sh.appendRow([new Date(), data.school, data.teacher || '', data.topic, data.result || '', data.recorder || '']);
  return 'บันทึกเรียบร้อย';
}

function listRecords() {
  const values = getSheet_().getDataRange().getDisplayValues();
  return values.slice(1).reverse().slice(0, 50);
}

function api_(e) {
  const key = PropertiesService.getScriptProperties().getProperty('API_KEY');
  if (!key || e.parameter.key !== key) return json_({ ok: false, message: 'unauthorized' });
  const values = getSheet_().getDataRange().getDisplayValues();
  const headers = values[0];
  const rows = values.slice(1).map(function (row) {
    const item = {};
    headers.forEach(function (h, i) { item[h] = row[i]; });
    return item;
  });
  return json_({ ok: true, count: rows.length, rows: rows });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
