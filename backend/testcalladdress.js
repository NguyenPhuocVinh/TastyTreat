import express from 'express';
import { caculateDistance } from './utils/calculate_distance.util.js';
const app = express();


// Endpoint để nhận vị trí từ frontend

  const latitude = 10.7908295;
  const longitude = 106.6443218;

  const yourLatitude = 10.824333; // Vĩ độ của bạn
  const yourLongitude = 106.600629; // Kinh độ của bạn

  // Tính toán khoảng cách
//   const distance = getDistanceFromLatLonInKm(yourLatitude, yourLongitude, latitude, longitude);
const distance = caculateDistance(yourLatitude, yourLongitude, latitude, longitude);

console.log('Khoảng cách giữa hai điểm là: ', distance);

// function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
//     var R = 6371; // Radius of the earth in km
//     var dLat = deg2rad(lat2-lat1);
//     var dLon = deg2rad(lon2-lon1);
//     var a =
//       Math.sin(dLat/2) * Math.sin(dLat/2) +
//       Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
//       Math.sin(dLon/2) * Math.sin(dLon/2)
//     ;
//     var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
//     var d = R * c; // Distance in km
//     return d;
// }


function deg2rad(deg) {
  return deg * (Math.PI/180)
}
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
