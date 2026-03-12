"use client";

import { useState } from "react";
import { Link2, Loader2, Sparkles, AlertCircle, ArrowRight, ExternalLink, CornerDownRight, ChevronRight, ChevronDown, FileWarning, Shield } from "lucide-react";
import { extractLinksAction, type LinkNode } from "./actions";

// Recursive component to render the Tree Nodes
function TreeNodeUI({ node, depth = 0 }: { node: LinkNode; depth?: number }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  console.log('node', node)
  return (
    <div className="flex flex-col">
      <div
        className={`flex items-start gap-2 py-2 px-3 rounded-lg transition-colors group ${depth === 0 ? 'bg-blue-500/10 border border-blue-500/20' : 'hover:bg-slate-800/50'}`}
        style={{ marginLeft: `${depth * 24}px` }}
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          disabled={!hasChildren}
          className={`mt-0.5 p-0.5 rounded shrink-0 transition-colors ${hasChildren ? 'hover:bg-slate-700 text-slate-400' : 'opacity-0 cursor-default'}`}
        >
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        {depth > 0 && <CornerDownRight className="w-4 h-4 mt-1 shrink-0 text-slate-600" />}

        <div className="flex flex-col min-w-0">
          <a
            href={node.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-slate-300 hover:text-blue-400 break-all transition-colors flex items-center gap-2"
          >
            {node.url}
            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>

          {node.error && (
            <span className="text-xs text-red-400 flex items-center gap-1 mt-1 font-mono bg-red-500/10 w-fit px-2 py-0.5 rounded">
              <FileWarning className="w-3 h-3" />
              {node.error}
            </span>
          )}

          {node.firewall && (
            <span className="text-xs text-orange-400 flex items-center gap-1 mt-1 font-mono bg-orange-500/10 w-fit px-2 py-0.5 rounded border border-orange-500/20 shadow-sm" title={`Protected by ${node.firewall}`}>
              <Shield className="w-3 h-3 text-orange-400" />
              Secured by {node.firewall}
            </span>
          )}
        </div>
      </div>

      {isExpanded && hasChildren && (
        <div className="flex flex-col relative before:absolute before:inset-y-0 before:-left-3 before:w-px before:bg-slate-700/50" style={{ marginLeft: `${depth * 24 + 16}px` }}>
          {node.children!.map((child, idx) => (
            <TreeNodeUI key={`${child.url}-${idx}`} node={child} depth={0} /> // depth reset to 0 because we handle margin in the wrapper
          ))}
        </div>
      )}
    </div>
  );
}

export default function LinkExtractor() {
  const [url, setUrl] = useState("");
  const [mode, setMode] = useState<"fast" | "spider">("fast");
  const [loading, setLoading] = useState(false);
  const [treeData, setTreeData] = useState<LinkNode | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    // Client-side URL validation
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;
    if (!urlPattern.test(url.trim())) {
      setError("Please enter a valid URL (e.g., https://example.com)");
      return;
    }

    setLoading(true);
    setError(null);
    setTreeData(null);

    // Call the Recursive Server Action with the selected mode
    const data = await extractLinksAction(url, mode);

    if (data?.error) {
      setError(data.error);
    } else if (data?.tree) {
      setTreeData(data.tree);
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-linear-to-br flex flex-col items-center p-6 pt-12 md:pt-24 from-slate-950 via-gray-900 to-slate-950 font-sans text-slate-100 selection:bg-indigo-500/30 overflow-x-hidden">
      <div className="w-full max-w-4xl space-y-8 animate-in fade-in zoom-in duration-700">

        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-4 bg-indigo-500/10 rounded-2xl mb-2 shadow-[0_0_30px_rgba(99,102,241,0.15)] ring-1 ring-white/5">
            <Link2 className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-indigo-400">
            Professional Link Extractor
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-xl mx-auto font-light">
            Instantly map out a website&apos;s network by traversing links and visualizing them.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl p-6 md:p-8 transition-all duration-300 hover:border-white/20 hover:shadow-[0_0_40px_rgba(99,102,241,0.1)]">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">

            {/* Mode Selector */}
            <div className="flex bg-slate-900/50 p-1 rounded-xl w-fit self-center border border-slate-700/50">
              <button
                type="button"
                onClick={() => setMode("fast")}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${mode === "fast" ? 'bg-indigo-500/20 text-indigo-300 shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
              >
                Fast Map
              </button>
              <button
                type="button"
                onClick={() => setMode("spider")}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${mode === "spider" ? 'bg-indigo-500/20 text-indigo-300 shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
              >
                Deep Spider
              </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative grow">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Link2 className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"

                  className="block w-full pl-12 pr-4 py-4 bg-slate-950/50 border border-slate-700/50 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-lg shadow-inner"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !url}
                className="group relative flex items-center justify-center gap-2 bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl font-medium transition-all duration-200 active:scale-[0.98] shadow-lg shadow-indigo-500/25 shrink-0"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{mode === "spider" ? "Spidering..." : "Crawling..."}</span>
                  </>
                ) : (
                  <>
                    <span>Map Site</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Error State */}
        {error && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl animate-in slide-in-from-bottom-4 fade-in duration-300 shadow-lg shadow-red-500/5">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Results Container: Flow Tree */}
        {treeData && (
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
              <h2 className="text-lg font-semibold text-slate-300 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                Result Diagram
              </h2>
            </div>

            <div className="w-full overflow-x-auto custom-scrollbar">
              <div className="min-w-fit pr-8">
                <TreeNodeUI node={treeData} depth={0} />
              </div>
            </div>
          </div>
        )}

        <footer className="w-full text-center mt-8 py-4 text-slate-500 text-sm font-light">
          &copy; {new Date().getFullYear()} Aye Myint Htet @ June
        </footer>
      </div>
    </main>
  );
}