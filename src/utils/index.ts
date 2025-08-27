import { integer, isInt } from "neo4j-driver";

export function safeToNumber(value: any): number {
  if (value == null) return 0;
  if (typeof value === 'number') return value;
  if (isInt(value)) return integer.toNumber(value);
  if (value.toNumber) return value.toNumber(); // para Floats u otros objetos con toNumber
  return 0;
}