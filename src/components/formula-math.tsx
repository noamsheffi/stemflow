import katex from "katex";
import "katex/dist/katex.min.css";

// Hebrew connecting words stay native RTL text, outside the math renderer.
export default function FormulaMath({ tex, display = false }: { tex: string; display?: boolean }) {
  const parts = tex.split(/(\\text\{[^{}]*[\u0590-\u05ff][^{}]*\})/g);
  return <span dir="ltr">{parts.map((part, index) => /^\\text\{[^{}]*[\u0590-\u05ff][^{}]*\}$/.test(part)
    ? <span key={index} dir="rtl"> {part.slice(6, -1)} </span>
    : <span key={index} dangerouslySetInnerHTML={{ __html: katex.renderToString(part, { displayMode: display, throwOnError: false, trust: false, output: "htmlAndMathml" }) }} />)}</span>;
}
