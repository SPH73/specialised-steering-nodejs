// Set date/time fields when submitting forms (only on pages that include them)
const dayField = document.getElementById('day');
const timeField = document.getElementById('time');

if (dayField || timeField) {
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

  if (dayField) {
    dayField.value = `${yr}/${mth}/${d}`;
  }

  let hr = date.getHours();
  let min = date.getMinutes();
  if (hr < 10) {
    hr = '0' + hr;
  }
  if (min < 10) {
    min = '0' + min;
  }

  if (timeField) {
    timeField.value = `${hr}:${min}`;
  }
}
