import {Point, guard as guardPoint} from "./Point";

export const TAU = Math.PI * 2;

export const degreeToRadian = (angleInDegrees:number) => (angleInDegrees - 90) * (Math.PI / 180.0);

export const radianToDegree = (angleInRadians:number) => angleInRadians * 180 / Math.PI;

export const radiansFromAxisX = (a:Point):number => Math.atan2(a.x, a.y);

export const polarToCartesian = (center:Point, radius:number, angleRadians:number) => {
  guardPoint(center);

  const a = a; //angleInRadians(angleInDegrees);
  return {
    x: center.x + (radius * Math.cos(a)),
    y: center.y + (radius * Math.sin(a)),
  };
};