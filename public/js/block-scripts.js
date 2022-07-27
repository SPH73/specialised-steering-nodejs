// get date and time when submitting forms

const date = new Date();
let d = date.getDate();
let mth = date.getMonth() + 1;
const yr = date.getFullYear();
if (d < 10) {
  d = '0' + d;
}
if (mth < 10) {
  mth = '0' + mth;
}
document.getElementById('day').value = `${yr}/${mth}/${d}`;

let hr = date.getHours();
let min = date.getMinutes();
if (hr < 10) {
  hr = '0' + hr;
}
if (min < 10) {
  min = '0' + min;
}
document.getElementById('time').value = `${hr}:${min}`;

// update copyright
let thisYear = new Date().getFullYear();
let yearEl = document.querySelector('.year');
yearEl.textContent = thisYear;

// remove r-click for images
let img = document.getElementsByTagName('img');
img.oncontextmenu = 'return false';
