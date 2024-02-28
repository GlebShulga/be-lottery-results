export type BonolotoResult = {
  fecha_sorteo: string;
  dia_semana: string;
  id_sorteo: string;
  game_id: string;
  anyo: string;
  numero: number;
  premio_bote: string;
  cdc: string;
  apuestas: string;
  recaudacion: string;
  combinacion: string;
  combinacion_acta: string;
  premios: string;
  fondo_bote: string;
  escrutinio: {
    tipo: string;
    categoria: number;
    premio: string;
    ganadores: string;
  }[];
  contenidosRelacionados: {
    noticias: {
      tituloRelacion: string;
      tituloContenido: string;
      urlContenido: string;
    }[];
    documentos: [
      {
        tituloRelacion: null;
        tituloContenido: string;
        urlContenido: string;
      },
    ];
  };
};
