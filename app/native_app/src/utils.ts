import chalk from "chalk"

const rdClr = () => Math.floor(Math.random() * 255);
export const randomColor = (str:string) => chalk.rgb(rdClr(), rdClr(), rdClr())(str);