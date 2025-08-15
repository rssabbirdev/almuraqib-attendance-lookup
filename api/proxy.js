export default async function handler(req, res) {
  const { mobile, startISO, endISO } = req.query;
  const scriptID = 'AKfycbx_XTWnCkdoay0HA_Kr7GTQGVInCLsRR467Z6kvz2R9pCYZyX5x1Z_JJl2tP323joCD'

  const url = `https://script.google.com/macros/s/${scriptID}/exec?action=getAttendanceDataByMobile&mobile=${mobile}&startISO=${startISO}&endISO=${endISO}`;

  const response = await fetch(url);
  const data = await response.json();

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).json(data);
}

// https://script.google.com/macros/s/AKfycbx_XTWnCkdoay0HA_Kr7GTQGVInCLsRR467Z6kvz2R9pCYZyX5x1Z_JJl2tP323joCD/exec?action=getAttendanceDataByMobile&mobile=0507463037&startISO=2025-08-01&endISO=2025-08-30
