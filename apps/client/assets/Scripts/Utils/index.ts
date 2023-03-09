import { SpriteFrame } from "cc";

const INDEX_REG = /\((\d+)\)/;

const getNumberWithinString = (str: string) => parseInt(str.match(INDEX_REG)?.[1] || "0");

export const sortSpriteFrame = (spriteFrame: Array<SpriteFrame>) =>
  spriteFrame.sort((a, b) => getNumberWithinString(a.name) - getNumberWithinString(b.name));


export const arc2dgree = (arc: number) => (arc / Math.PI) * 180

export const deepClone = (src: any) => {
  if (typeof src !== 'object' || src === null) return src

  const target = Array.isArray(src) ? [] : {}

  for (const key in src) {
    if (Object.prototype.hasOwnProperty.call(src, key)) {
      target[key] = deepClone(src[key])
    }
  }

  return target
}

export const randomBySeed = function randomBySeed(seed: number) {
  return () => {
    const num = (seed * 9301 + 49297) % 233280
    seed = num
    return num / 233280
  }
}