export interface ConfiguracionP {
  nombre: string;
  r1912: number;
  r1913: number;
  r1915: number;
  r1925: number;
  r1927: number;
  r1932_0: number;
  r1932_1: number;
  r1943_0: number;
  r1936: number;
  r1948: number;
  corriente: number;
  rpm: number;
}

export type FaseApp = "inicio" | "entrada" | "csv" | "seleccion" | "resultados";

export interface EstadoApp {
  fase: FaseApp;
  configuraciones: ConfiguracionP[];
  ranking: number[];
}

export const CAMPOS_PARAMETROS: { key: keyof ConfiguracionP; label: string; unit: string }[] = [
  { key: "r1912", label: "R1912", unit: "" },
  { key: "r1913", label: "R1913", unit: "" },
  { key: "r1915", label: "R1915", unit: "" },
  { key: "r1925", label: "R1925", unit: "" },
  { key: "r1927", label: "R1927", unit: "" },
  { key: "r1932_0", label: "R1932[0]", unit: "" },
  { key: "r1932_1", label: "R1932[1]", unit: "" },
  { key: "r1943_0", label: "R1943[0]", unit: "" },
  { key: "r1936", label: "R1936", unit: "" },
  { key: "r1948", label: "R1948", unit: "" },
  { key: "corriente", label: "Corriente", unit: "A" },
  { key: "rpm", label: "RPM", unit: "rpm" },
];
