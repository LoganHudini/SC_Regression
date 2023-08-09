const todayDate = new Date();
todayDate.setHours(0);
todayDate.setMinutes(0);
todayDate.setSeconds(0);
todayDate.setMilliseconds(0);
const tomorrowDate = new Date();
tomorrowDate.setHours(0);
tomorrowDate.setMinutes(0);
tomorrowDate.setSeconds(0);
tomorrowDate.setMilliseconds(0);
tomorrowDate.setDate(tomorrowDate.getDate() + 1);
const immediateDate = new Date();

export { todayDate, tomorrowDate, immediateDate };
