export function getResultMessage(isNewBest: boolean, isRankOne: boolean): '멋쟁이네~' | '재미난 친구네 ?' {
  return isNewBest || isRankOne ? '멋쟁이네~' : '재미난 친구네 ?';
}
