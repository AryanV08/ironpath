/**
 * Callout lines tuned to match layout/more_details_page.png:
 * from left edge of electrode inset → center of shirt sensors.
 */
export function SensorCalloutLines() {
  return (
    <svg
      className="sensor-callout-overlay"
      viewBox="0 0 360 260"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      {/* Left edge of inset circle → centers of shirt sensors (more_details_page.png) */}
      <line x1="238" y1="72" x2="214" y2="44" className="sensor-callout-line" />
      <line x1="238" y1="94" x2="200" y2="90" className="sensor-callout-line" />
      <line x1="238" y1="116" x2="168" y2="114" className="sensor-callout-line" />
    </svg>
  );
}
