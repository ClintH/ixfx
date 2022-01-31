import {Point, guard as guardPoint} from "./Point";

export const degreeToRadian = (angleInDegrees:number) => (angleInDegrees - 90) * (Math.PI / 180.0);

export const radianToDegree = (angleInRadians:number) => angleInRadians * 180 / Math.PI;

export const radiansFromAxisX = (point:Point):number => Math.atan2(point.x, point.y);

export const polarToCartesian = (center:Point, radius:number, angleRadians:number) => {
  guardPoint(center);
  return {
    x: center.x + (radius * Math.cos(angleRadians)),
    y: center.y + (radius * Math.sin(angleRadians)),
  };
};