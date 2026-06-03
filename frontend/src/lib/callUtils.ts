// export function makeRoomId(userA: string, userB: string) {
//   const ids = [userA, userB].sort().join("-");
//   const random = Math.random().toString(36).slice(2, 8);
//   return `${ids}-${random}`; // not cryptographically secure; ok for PoC
// }