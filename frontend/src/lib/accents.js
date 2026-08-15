/** Paleta por sabor. Se usa para teñir tarjetas cuando no hay foto todavía. */
export const ACCENTS = {
  rosa: { hex: '#f2c6c2', label: 'Rosa' },
  cereza: { hex: '#d98088', label: 'Cereza' },
  pistacho: { hex: '#b8c9a0', label: 'Pistacho' },
  limon: { hex: '#e8dc8a', label: 'Limón' },
  dulce: { hex: '#d7a86e', label: 'Dulce de leche' },
  cacao: { hex: '#a9785f', label: 'Cacao' },
  vainilla: { hex: '#efe0c4', label: 'Vainilla' },
  lila: { hex: '#cdbfe4', label: 'Lila' },
}

export const accentHex = (name) => (ACCENTS[name] ?? ACCENTS.rosa).hex

export const ACCENT_NAMES = Object.keys(ACCENTS)
