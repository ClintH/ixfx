
//eslint-disable-next-line functional/prefer-readonly-type
export const rotatePointArray = (
  v: ReadonlyArray<ReadonlyArray<number>>,
  amountRadian: number
): Array<Array<number>> => {
  const mat = [
    [ Math.cos(amountRadian), -Math.sin(amountRadian) ],
    [ Math.sin(amountRadian), Math.cos(amountRadian) ],
  ];
  const result = [];
  for (const [ index, element ] of v.entries()) {
    //eslint-disable-next-line functional/immutable-data
    result[ index ] = [
      mat[ 0 ][ 0 ] * element[ 0 ] + mat[ 0 ][ 1 ] * element[ 1 ],
      mat[ 1 ][ 0 ] * element[ 0 ] + mat[ 1 ][ 1 ] * element[ 1 ],
    ];
  }
  return result;
};