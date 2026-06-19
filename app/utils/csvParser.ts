import { ConfiguracionP } from "../types";

// Normaliza un nombre de columna a la clave interna del app
function normalizeKey(col: string): keyof ConfiguracionP | null {
  const s = col
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/\[/g, "_")
    .replace(/\]/g, "")
    .replace(/^r0*/, "r"); // quita ceros redundantes por si acaso

  const MAP: Record<string, keyof ConfiguracionP> = {
    r1912: "r1912",
    r1913: "r1913",
    r1915: "r1915",
    r1925: "r1925",
    r1927: "r1927",
    r1932_0: "r1932_0",
    r1932_1: "r1932_1",
    // CSV usa r1934[0] pero el campo interno es r1943_0
    r1943_0: "r1943_0",
    r1934_0: "r1943_0",
    r1936: "r1936",
    r1948: "r1948",
    corriente: "corriente",
    // Acepta "amperaje", "rpm", "velocidad" como sinónimos de rpm
    amperaje: "rpm",
    rpm: "rpm",
    velocidad: "rpm",
  };

  return MAP[s] ?? null;
}

export interface ParseResult {
  ok: true;
  configuraciones: ConfiguracionP[];
  warnings: string[];
}

export interface ParseError {
  ok: false;
  error: string;
}

export function parseCSV(raw: string): ParseResult | ParseError {
  // Quitar BOM de Excel
  const text = raw.replace(/^﻿/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = text.split("\n").filter((l) => l.trim() !== "");

  if (lines.length < 2) {
    return { ok: false, error: "El archivo no tiene datos. Se necesita al menos una fila de encabezado y una fila de datos." };
  }

  // Detectar delimitador: coma o punto y coma
  const delimiter = lines[0].includes(";") ? ";" : ",";

  const headers = lines[0].split(delimiter).map((h) => h.trim().replace(/^["']|["']$/g, ""));
  const keyMap: (keyof ConfiguracionP | null)[] = headers.map(normalizeKey);

  const warnings: string[] = [];
  const REQUIRED: (keyof ConfiguracionP)[] = [
    "r1912","r1913","r1915","r1925","r1927",
    "r1932_0","r1932_1","r1943_0","r1936","r1948",
    "corriente","rpm",
  ];
  const foundKeys = new Set(keyMap.filter(Boolean) as (keyof ConfiguracionP)[]);
  const missing = REQUIRED.filter((k) => !foundKeys.has(k));
  if (missing.length > 0) {
    return {
      ok: false,
      error: `Faltan columnas requeridas: ${missing.join(", ")}.\n\nEncabezados detectados: ${headers.join(", ")}`,
    };
  }

  const unrecognized = headers.filter((_, i) => keyMap[i] === null && headers[i] !== "");
  if (unrecognized.length > 0) {
    warnings.push(`Columnas ignoradas (no reconocidas): ${unrecognized.join(", ")}`);
  }

  const configuraciones: ConfiguracionP[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(delimiter).map((v) => v.trim().replace(/^["']|["']$/g, ""));
    const config: Partial<ConfiguracionP> = { nombre: `P${i}` };

    for (let c = 0; c < headers.length; c++) {
      const key = keyMap[c];
      if (!key) continue;
      const val = parseFloat(row[c]);
      if (isNaN(val)) {
        return {
          ok: false,
          error: `Fila ${i + 1}, columna "${headers[c]}": valor "${row[c]}" no es un número válido.`,
        };
      }
      (config as Record<string, number | string>)[key] = val;
    }

    configuraciones.push(config as ConfiguracionP);
  }

  return { ok: true, configuraciones, warnings };
}
