export const hourToText = (hour: number , wantText = true) => {
  let x = 0;
  let mins
  if (hour.toString().split(".").length === 1) {
    mins = 0
  } else {
    mins = Number(hour.toString().split(".")[1]);
  }
  if (mins >= 10 || (hour * 100) < 10 ) {
    x = 0.6;
  } else {
    x = 6;
  }
  if (hour === 0) return "Enough time ( 0 )"
  if (wantText) {
    return `${
      Math.floor(hour) === 0 ? "" : `${Math.floor(hour)} Hours`
    } ${Math.floor(hour) !== 0 && Math.floor(mins * x) !== 0 ? `and` : ""} ${Math.floor(mins * x) === 0 ? "" : `${Math.floor(mins * x)} Minutes`}`;
  } else {
    return `${Math.floor(hour).toString().padStart(2 , "0")}:${Math.floor(mins * x).toString().padStart(2 , "0")}`
  }
};