// ELO Calculation Service
// Formula based on standard Elo rating system

const K_FACTOR = 32;

/**
 * Calculate expected score for player A against player B
 * @returns Expected probability of player A winning (0.0 to 1.0)
 */
export function expectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

/**
 * Calculate new ELO ratings after a match
 * @param rating1 Player 1's current rating
 * @param rating2 Player 2's current rating
 * @param result 1 if Player 1 won, 0 if Player 2 won, 0.5 for a draw
 * @returns Tuple with new ratings: [newRating1, newRating2, delta1, delta2]
 */
export function calculateElo(
  rating1: number,
  rating2: number,
  result: 1 | 0 | 0.5
): [number, number, number, number] {
  const expected1 = expectedScore(rating1, rating2);
  const expected2 = expectedScore(rating2, rating1);

  const newRating1 = Math.round(rating1 + K_FACTOR * (result - expected1));
  // result for player 2 is (1 - result)
  const newRating2 = Math.round(rating2 + K_FACTOR * ((1 - result) - expected2));

  const delta1 = newRating1 - rating1;
  const delta2 = newRating2 - rating2;

  return [newRating1, newRating2, delta1, delta2];
}
