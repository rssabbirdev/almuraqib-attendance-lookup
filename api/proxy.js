export default async function handler(req, res) {
  const { mobile, startISO, endISO } = req.query;

  const url = `https://script.google.com/macros/s/AKfycbw5Mghwwt3ddL8mXsSEvX9uKbqhCRy-7aUwaRNHbHMj0i_1A9WnM4oA7uwjc7g0x7oj/exec?action=getAttendanceDataByMobile&mobile=${mobile}&startISO=${startISO}&endISO=${endISO}`;

  const response = await fetch(url);
  const data = await response.json();

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).json(data);
}
