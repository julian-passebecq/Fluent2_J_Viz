export function Glyph({ family, small = false }: { family: string; small?: boolean }) {
  return (
    <svg className={small ? 'glyph small' : 'glyph'} viewBox="0 0 72 42" fill="none" aria-hidden="true">
      {family === 'histogram' ? (
        [9, 20, 31, 24, 15, 6].map((height, index) => (
          <rect
            key={index}
            x={6 + index * 10}
            y={38 - height}
            width="8"
            height={height}
            fill="currentColor"
            opacity={0.4 + index * 0.08}
          />
        ))
      ) : family === 'bump' ? (
        <>
          <path d="M6 8L26 12 46 28 66 34M6 34L26 28 46 10 66 7" stroke="currentColor" strokeWidth="3" />
          <path d="M6 21L26 20 46 20 66 21" stroke="currentColor" strokeWidth="2" opacity=".4" />
        </>
      ) : family === 'small-multiples' ? (
        [
          [4, 3],
          [39, 3],
          [4, 24],
          [39, 24],
        ].map(([x, y], index) => (
          <g key={index} transform={`translate(${x} ${y})`}>
            <path d="M0 0V15H27" stroke="currentColor" opacity=".25" />
            <path d={`M2 12L10 ${8 + index} 18 9 26 ${2 + index}`} stroke="currentColor" strokeWidth="2" />
          </g>
        ))
      ) : family === 'stacked-area' ? (
        <>
          <path d="M5 36V29L24 25 43 27 66 20V36Z" fill="currentColor" opacity=".3" />
          <path d="M5 29V20L24 18 43 14 66 4V20L43 27 24 25Z" fill="currentColor" opacity=".7" />
        </>
      ) : family === 'choropleth' ? (
        <>
          <path d="M4 8L27 3 30 21 7 24Z" fill="currentColor" opacity=".3" />
          <path d="M33 4L64 9 60 28 34 22Z" fill="currentColor" opacity=".8" />
          <path d="M10 28L30 25 49 32 36 40 14 38Z" fill="currentColor" opacity=".5" />
        </>
      ) : family === 'ranking' ? (
        [46, 34, 55, 26].map((w, i) => (
          <rect
            key={i}
            x="8"
            y={5 + i * 9}
            width={w}
            height="5"
            rx="2"
            fill="currentColor"
            opacity={1 - i * 0.15}
          />
        ))
      ) : family === 'scatter' || family === 'event-map' ? (
        [
          [17, 29, 7],
          [34, 17, 10],
          [57, 10, 5],
          [55, 32, 7],
        ].map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill="currentColor" opacity={0.25 + i * 0.18} />
        ))
      ) : family === 'table' || family === 'matrix' ? (
        [8, 18, 28, 38].map((y, i) => (
          <g key={y}>
            <path d={`M8 ${y} H64`} stroke="currentColor" opacity=".25" />
            <rect
              x={family === 'matrix' ? 18 : 33}
              y={y - 5}
              width={17 + i * 3}
              height="3"
              fill="currentColor"
              opacity=".6"
            />
          </g>
        ))
      ) : family === 'dumbbell' ? (
        [10, 21, 32].map((y, i) => (
          <g key={y}>
            <path d={`M${10 + i * 7} ${y} H${59 - i * 4}`} stroke="currentColor" />
            <circle cx={10 + i * 7} cy={y} r="3" stroke="currentColor" />
            <circle cx={59 - i * 4} cy={y} r="3" fill="currentColor" />
          </g>
        ))
      ) : family === 'flow' ? (
        <>
          <path
            d="M10 9C33 9 34 30 62 30M10 28C35 28 32 10 62 10"
            stroke="currentColor"
            strokeWidth="10"
            opacity=".25"
          />
          <path d="M10 9C35 9 34 10 62 10" stroke="currentColor" strokeWidth="8" opacity=".7" />
        </>
      ) : family === 'contribution' ? (
        <>
          <path
            d="M8 35V21H18V35M24 21V9H34V21M40 9V17H50V9M56 35V17H66V35"
            fill="currentColor"
            opacity=".7"
          />
        </>
      ) : (
        <>
          <path d="M5 34L19 30 33 26 47 16 67 5" stroke="currentColor" strokeWidth="2.5" />
          <path d="M5 20L19 18 33 19 47 14 67 12" stroke="currentColor" strokeWidth="2" opacity=".3" />
          <path d="M5 36L19 33 33 28 47 22 67 13" stroke="currentColor" strokeWidth="1.5" opacity=".5" />
        </>
      )}
    </svg>
  );
}
