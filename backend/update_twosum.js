require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const statement = `
Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.

### Example 1:
\`\`\`
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
\`\`\`

### Example 2:
\`\`\`
Input: nums = [3,2,4], target = 6
Output: [1,2]
\`\`\`

### Example 3:
\`\`\`
Input: nums = [3,3], target = 6
Output: [0,1]
\`\`\`

### Constraints:
* \`2 <= nums.length <= 10^4\`
* \`-10^9 <= nums[i] <= 10^9\`
* \`-10^9 <= target <= 10^9\`
* **Only one valid answer exists.**

### Complexity Requirements:
* **Time Complexity:** O(N) expected, where N is the number of elements in the array.
* **Space Complexity:** O(N) expected to store elements in a hash map.

---
**Test Case Walkthrough:**
Let's trace Example 1: \`nums = [2, 7, 11, 15]\`, \`target = 9\`.
1. We initialize an empty hash map to store seen numbers and their indices.
2. We look at \`2\` (index \`0\`). The needed complement is \`9 - 2 = 7\`. \`7\` is not in our map. We add \`2\` to the map: \`{2: 0}\`.
3. We look at \`7\` (index \`1\`). The needed complement is \`9 - 7 = 2\`. We see \`2\` is in our map at index \`0\`!
4. We found our pair! We return \`[0, 1]\`.
`;

async function update() {
  let success = false;
  let attempts = 0;
  while (!success && attempts < 5) {
      try {
        console.log("Attempt", attempts+1);
        const res = await pool.query('UPDATE problems SET statement = $1 WHERE title = $2 RETURNING id, title', [statement, 'Two Sum']);
        console.log('Updated:', res.rows);
        success = true;
      } catch (err) {
        console.error(err.message);
        attempts++;
        await new Promise(r => setTimeout(r, 2000));
      }
  }
  pool.end();
}

update();
