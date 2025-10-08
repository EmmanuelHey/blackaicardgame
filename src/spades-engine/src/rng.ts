// very small deterministic PRNG for learning
function hashString(seed: string): number {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < seed.length; i++) {
      h ^= seed.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  
  export function xorshift32(seed: string): () => number {
    let x = hashString(seed) || 123456789;
    return () => {
      x ^= x << 13; x >>>= 0;
      x ^= x >> 17; x >>>= 0;
      x ^= x << 5;  x >>>= 0;
      // 0..1
      return (x >>> 0) / 0x100000000;
    };
  }
  