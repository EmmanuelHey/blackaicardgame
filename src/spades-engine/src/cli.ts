import readline from "node:readline";
import { startHand, playCard } from "./engine";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const state = startHand("demo-seed");

console.log("Your hand:", state.hands.N);
rl.question("Play a card (e.g., S_A): ", ans => {
  try {
    playCard(state, "N", ans.trim() as any);
    console.log("Played:", ans);
  } catch (e) {
    console.error("Illegal play:", e);
  }
  rl.close();
});
