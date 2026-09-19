import source from "./concept-map-data.json";

// The source calls the time/frequency concept by two IDs. Unspecified concepts
// remain unavailable rather than linking to a page that does not exist.
const ids = new Set(source.map((concept) => concept.id));
export const conceptMap = source.map((concept) => ({
  ...concept,
  connections: [...new Set(concept.connections.map((id) => id === "frequency-domain" ? "time-freq-domains" : id))].filter((id) => ids.has(id)),
}));
export const conceptFormulaIds: Record<string, string[]> = {
  transmitter: ["am_power_total"],
  "wavelength-antenna": ["lambda", "dipole", "monopole"],
  "wave-propagation": ["los_horizon"],
  filters: ["filter_cutoff", "bandwidth_general"],
  "periodic-random": ["freq_period"],
  "time-freq-domains": ["freq_period", "angular_freq", "general_sine"],
  "harmonics-fourier": ["fundamental_gcd"],
  bandwidth: ["bandwidth_general", "am_bandwidth"],
  oscillator: ["barkhausen_steady"],
  "thermal-noise": ["barkhausen_startup"],
  barkhausen: ["barkhausen_steady", "barkhausen_startup"],
  "colpitts-hartley": ["colpitts_freq", "hartley_freq"],
  "wien-bridge": ["wien_bridge"],
  "modulation-need": ["lambda"],
  "carrier-wave": ["general_sine", "am_time_domain"],
  "modulation-am": ["am_time_domain"],
  "envelope-ma": ["am_envelope", "am_mod_index"],
  "spectrum-am": ["am_spectrum_components", "am_bandwidth"],
  "power-efficiency-am": ["am_power_carrier", "am_power_sidebands", "am_power_total", "am_efficiency"],
};
