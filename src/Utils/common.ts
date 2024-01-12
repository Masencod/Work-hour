export const hourToText = (hour: number , wantText = true) => {
  let x = 0;
  let mins : string
  if (hour.toString().split(".").length === 1) {
    mins = "0"
  } else {
    mins = hour.toString().split(".")[1];
  }
  if (mins.length === 2) {
    x = 0.6;
  } else {
    x = 6;
  }
  if (hour === 0) return "Enough time ( 0 )"
  if (wantText) {
    return `${
      Math.floor(hour) === 0 ? "" : `${Math.floor(hour)} Hours`
    } ${Math.floor(hour) !== 0 && Math.floor(Number(mins) * x) !== 0 ? `and` : ""} ${Math.floor(Number(mins) * x) === 0 ? "" : `${Math.floor(Number(mins) * x)} Minutes`}`;
  } else {
    return `${Math.floor(hour).toString().padStart(2 , "0")}:${Math.floor(Number(mins) * x).toString().padStart(2 , "0")}`
  }
};