"use client"
import { useState, useMemo } from "react";
import {
  Link2, Loader2, Sparkles, AlertCircle, ArrowRight, ExternalLink,
  CornerDownRight, ChevronRight, ChevronDown, FileWarning, Shield,
  Activity, ImageIcon, Target, Search, Filter, Download, Share2,
  Layout, List, Info, Type, MessageSquare, Globe, Twitter, Eye, X
} from "lucide-react";
import { type LinkNode } from "./actions";

// Recursive component to render the Tree Nodes
function TreeNodeUI({ node, depth = 0, filterText = "", onlyIssues = false }: {
  node: LinkNode;
  depth?: number;
  filterText?: string;
  onlyIssues?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const [showMetadata, setShowMetadata] = useState(false);

  // Determine if this node should be visible based on filters
  const isMatch = node.url.toLowerCase().includes(filterText.toLowerCase());
  const hasIssue = (node.status && node.status >= 400) || node.error || (node.seoIssues?.missingAltImages?.length || 0) > 0;

  if (filterText && !isMatch && !hasChildren) return null;
  if (onlyIssues && !hasIssue && !hasChildren) return null;

  return (
    <div className="flex flex-col">
      <div
        className={`flex items-start gap-2 py-2 px-3 rounded-lg transition-all group border border-transparent ${depth === 0 ? 'bg-blue-500/10 border-blue-500/20' : 'hover:bg-slate-800/50'}`}
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

        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href={node.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-slate-300 hover:text-blue-400 break-all transition-colors flex items-center gap-2"
            >
              {node.url}
              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>

            {node.seoData?.title && (
              <span className="text-[10px] uppercase tracking-wider font-bold bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700 inline-block">
                {node.seoData.title.slice(0, 30)}{node.seoData.title.length > 30 ? '...' : ''}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mt-1">
            {(node.error || (node.status && node.status >= 400)) && (
              <span className="text-[10px] text-red-400 flex items-center gap-1 font-semibold bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                <FileWarning className="w-3 h-3" />
                {node.status && node.status >= 400 ? `Broken (${node.status})` : node.error}
              </span>
            )}

            {node.seoIssues?.missingAltImages && node.seoIssues.missingAltImages.length > 0 && (
              <span className="text-[10px] text-amber-400 flex items-center gap-1 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                <ImageIcon className="w-3 h-3 text-amber-500 shrink-0" />
                Missing Alt ({node.seoIssues.missingAltImages.length})
              </span>
            )}

            {node.firewall && (
              <span className="text-[10px] text-orange-400 flex items-center gap-1 font-semibold bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20 shadow-sm">
                <Shield className="w-3 h-3 text-orange-400" />
                {node.firewall}
              </span>
            )}

            {node.seoData && (
              <button
                onClick={() => setShowMetadata(!showMetadata)}
                className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors cursor-pointer"
              >
                <Eye className="w-3 h-3" />
                {showMetadata ? 'Hide SEO' : 'View SEO'}
              </button>
            )}
          </div>

          {/* Expanded Metadata View */}
          {showMetadata && node.seoData && (
            <div className="mt-3 p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                    <Globe className="w-3 h-3" /> Basic Info
                  </label>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-300"><span className="text-slate-500">Title:</span> {node.seoData.title || <span className="text-red-500/50">Missing</span>}</p>
                    <p className="text-xs text-slate-400 leading-relaxed"><span className="text-slate-500">Desc:</span> {node.seoData.description || <span className="text-red-500/50">Missing</span>}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                    <Twitter className="w-3 h-3" /> Social Metadata
                  </label>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-300"><span className="text-slate-500">OG Title:</span> {node.seoData.ogTitle || 'None'}</p>
                    <p className="text-xs text-slate-400"><span className="text-slate-500">Tw Card:</span> {node.seoData.twitterCard || 'None'}</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 mb-2">
                  <Type className="w-3 h-3" /> Heading Structure
                </label>
                <div className="flex flex-wrap gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500">H1 ({node.seoData.h1?.length || 0})</span>
                    <ul className="text-xs text-slate-400 list-disc ml-4">
                      {node.seoData.h1?.slice(0, 2).map((h, i) => <li key={i}>{h}</li>)}
                    </ul>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500">H2 ({node.seoData.h2?.length || 0})</span>
                    <ul className="text-xs text-slate-400 list-disc ml-4">
                      {node.seoData.h2?.slice(0, 2).map((h, i) => <li key={i}>{h}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {isExpanded && hasChildren && (
        <div className="flex flex-col relative before:absolute before:inset-y-0 before:-left-3 before:w-px before:bg-slate-700/50" style={{ marginLeft: `${depth * 24 + 16}px` }}>
          {node.children!.map((child, idx) => (
            <TreeNodeUI key={`${child.url}-${idx}`} node={child} depth={0} filterText={filterText} onlyIssues={onlyIssues} />
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

  // UI States
  const [filterText, setFilterText] = useState("");
  const [onlyIssues, setOnlyIssues] = useState(false);
  const [activeTab, setActiveTab] = useState<"tree" | "map">("tree");

  // Computed SEO Summary
  const seoSummary = useMemo(() => {
    if (!treeData) return null;
    let scanned = 0;
    let broken = 0;
    let missingAlts = 0;

    function walk(n: LinkNode) {
      scanned++;
      if ((n.status && n.status >= 400) || n.error) broken++;
      if (n.seoIssues?.missingAltImages) {
        missingAlts += n.seoIssues.missingAltImages.length;
      }
      if (n.children) n.children.forEach(walk);
    }

    walk(treeData);
    return { scanned, broken, missingAlts };
  }, [treeData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;
    if (!urlPattern.test(url.trim())) {
      setError("Please enter a valid URL (e.g., https://example.com)");
      return;
    }

    setLoading(true);
    setError(null);
    setTreeData(null);

    try {
      // Phase 4: Real-time Streaming Results
      const response = await fetch(`/api/crawl?url=${encodeURIComponent(url)}&mode=${mode}`);
      if (!response.ok) throw new Error("Crawl failed");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let rootNode: LinkNode | null = null;
        const nodesMap = new Map<string, LinkNode>();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n").filter(l => l.trim());

          for (const line of lines) {
            try {
              const data = JSON.parse(line);
              if (data.error) {
                setError(data.error);
                continue;
              }

              const newNode = data.node as LinkNode;
              if (!newNode) continue;

              // Register node in map
              nodesMap.set(newNode.url, newNode);

              if (!newNode.parentUrl) {
                rootNode = newNode;
                setTreeData({ ...newNode });
              } else {
                // Find parent and attach
                const parent = nodesMap.get(newNode.parentUrl);
                if (parent) {
                  if (!parent.children) parent.children = [];
                  // Avoid duplicates
                  if (!parent.children.some(c => c.url === newNode.url)) {
                    parent.children.push(newNode);
                  }

                  // Trigger re-render by updating root reference
                  if (rootNode) {
                    setTreeData({ ...rootNode });
                  }
                }
              }
            } catch (e) {
              console.warn("Could not parse chunk line", e);
            }
          }
        }
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!treeData) return;
    const rows: string[][] = [["URL", "Status", "Error", "Title", "Missing Alt Text Count"]];

    function walk(n: LinkNode) {
      rows.push([
        n.url,
        n.status?.toString() || "",
        n.error || "",
        n.seoData?.title || "",
        n.seoIssues?.missingAltImages?.length.toString() || "0"
      ]);
      if (n.children) n.children.forEach(walk);
    }

    walk(treeData);
    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `audit-report-${new URL(url).hostname}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="min-h-screen bg-linear-to-br flex flex-col items-center p-6 pt-12 md:pt-24 from-slate-950 via-gray-900 to-slate-950 font-sans text-slate-100 selection:bg-indigo-500/30 overflow-x-hidden">
      <div className="w-full max-w-5xl space-y-8 animate-in fade-in zoom-in duration-700">

        {/* Header Section */}
        <div className="text-center space-y-4">
          <svg width="0" height="0" className="absolute">
            <defs>
              <linearGradient id="brand-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FD8451" />
                <stop offset="100%" stopColor="#FFBD6F" />
              </linearGradient>
            </defs>
          </svg>
          <div className="inline-flex items-center justify-center p-4 bg-[#FD8451]/10 rounded-2xl mb-2 shadow-[0_0_30px_rgba(253,132,81,0.15)] ring-1 ring-white/5">
            <Target className="w-8 h-8" color="url(#brand-gradient)" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-linear-to-br from-[#FD8451] to-[#FFBD6F]">
            Broken Link & SEO Auditor
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-xl mx-auto font-light">
            Crawl any website to instantly find broken links, 404s, and images missing SEO-friendly Alt Text.
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
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${mode === "fast" ? 'bg-[#FD8451]/20 text-[#FFBD6F] shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
              >
                Fast Map
              </button>
              <button
                type="button"
                onClick={() => setMode("spider")}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${mode === "spider" ? 'bg-[#FD8451]/20 text-[#FFBD6F] shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
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
                className="group relative flex items-center justify-center gap-2 bg-linear-to-br from-[#FD8451] to-[#FFBD6F] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl font-medium transition-all duration-200 active:scale-[0.98] shadow-lg shadow-[#FD8451]/25 shrink-0"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{mode === "spider" ? "Auditing..." : "Scanning..."}</span>
                  </>
                ) : (
                  <>
                    <span>Run Audit</span>
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

        {/* Results Container: Summary */}
        {seoSummary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
              <Activity className="w-6 h-6 text-blue-400 mb-2" />
              <div className="text-3xl font-bold text-slate-100">{seoSummary.scanned}</div>
              <div className="text-sm font-medium text-slate-400 mt-1">Pages & Links Scanned</div>
            </div>
            <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden group">
              <div className={`absolute inset-0 opacity-10 transition-opacity ${seoSummary.broken > 0 ? 'bg-red-500 group-hover:opacity-20' : 'bg-emerald-500 group-hover:opacity-20'}`}></div>
              <FileWarning className={`w-6 h-6 mb-2 ${seoSummary.broken > 0 ? 'text-red-400' : 'text-emerald-400'}`} />
              <div className="text-3xl font-bold text-slate-100">{seoSummary.broken}</div>
              <div className="text-sm font-medium text-slate-400 mt-1">Broken Links (404s)</div>
            </div>
            <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden group">
              <div className={`absolute inset-0 opacity-10 transition-opacity ${seoSummary.missingAlts > 0 ? 'bg-amber-500 group-hover:opacity-20' : 'bg-emerald-500 group-hover:opacity-20'}`}></div>
              <ImageIcon className={`w-6 h-6 mb-2 ${seoSummary.missingAlts > 0 ? 'text-amber-400' : 'text-emerald-400'}`} />
              <div className="text-3xl font-bold text-slate-100">{seoSummary.missingAlts}</div>
              <div className="text-sm font-medium text-slate-400 mt-1">Images Missing Alt Text</div>
            </div>
          </div>
        )}

        {/* Results Container: Detailed View */}
        {treeData && (
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center pb-6 border-b border-slate-800">
              <div className="flex bg-slate-950/50 p-1 rounded-xl border border-slate-800 shrink-0">
                <button
                  onClick={() => setActiveTab("tree")}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === "tree" ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <List className="w-3.5 h-3.5" />
                  Tree View
                </button>
                <button
                  onClick={() => setActiveTab("map")}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === "map" ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <Layout className="w-3.5 h-3.5" />
                  Visual Map
                </button>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative grow md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search results..."
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-lg py-1.5 pl-9 pr-4 text-xs text-slate-300 focus:outline-none focus:border-blue-500/50"
                  />
                  {filterText && (
                    <button onClick={() => setFilterText("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                      <X className="w-3 h-3 text-slate-500" />
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setOnlyIssues(!onlyIssues)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${onlyIssues ? 'bg-red-500/10 border-red-500/50 text-red-400' : 'bg-slate-950/50 border-slate-800 text-slate-500'}`}
                >
                  <Filter className="w-3.5 h-3.5" />
                  Issues Only
                </button>

                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-xs font-semibold text-emerald-400 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export
                </button>
              </div>
            </div>

            <div className="w-full overflow-x-auto custom-scrollbar">
              {activeTab === "tree" ? (
                <div className="min-w-fit pr-8">
                  <TreeNodeUI node={treeData} depth={0} filterText={filterText} onlyIssues={onlyIssues} />
                </div>
              ) : (
                <div className="w-full h-full relative p-4 flex items-center justify-center overflow-auto custom-scrollbar">
                  {/* Phase 5: Dynamic Site Map Visualization */}
                  <svg width="100%" height="100%" viewBox="0 0 1000 1000" className="max-w-4xl mx-auto overflow-visible">
                    <defs>
                      <marker id="arrow" markerWidth="10" markerHeight="10" refX="25" refY="3" orient="auto" markerUnits="strokeWidth">
                        <path d="M0,0 L0,6 L9,3 z" fill="#475569" />
                      </marker>
                    </defs>

                    {/* Radial Distribution Logic */}
                    {(() => {
                      const nodes: Array<{ x: number, y: number, url: string, status?: number, error?: string }> = [];
                      const links: Array<{ x1: number, y1: number, x2: number, y2: number }> = [];

                      function plot(node: LinkNode, x: number, y: number, angle: number, angleRange: number, depth: number) {
                        const id = nodes.length;
                        nodes.push({ x, y, url: node.url, status: node.status, error: node.error });

                        if (node.children && depth < 3) {
                          const count = node.children.length;
                          const startAngle = angle - angleRange / 2;
                          const sliceAngle = angleRange / Math.max(count, 1);
                          const radius = 240 / (depth + 1);

                          node.children.forEach((child, i) => {
                            const childAngle = startAngle + sliceAngle * (i + 0.5);
                            const cx = x + radius * Math.cos(childAngle);
                            const cy = y + radius * Math.sin(childAngle);

                            links.push({ x1: x, y1: y, x2: cx, y2: cy });
                            plot(child, cx, cy, childAngle, sliceAngle * 0.8, depth + 1);
                          });
                        }
                      }

                      if (treeData) plot(treeData, 500, 500, 0, Math.PI * 2, 0);

                      return (
                        <>
                          {links.map((link, i) => (
                            <line key={`l-${i}`} x1={link.x1} y1={link.y1} x2={link.x2} y2={link.y2} className="stroke-slate-800" strokeWidth="1.5" markerEnd="url(#arrow)" />
                          ))}
                          {nodes.map((node, i) => {
                            const isBroken = (node.status && node.status >= 400) || node.error;
                            return (
                              <g key={`n-${i}`} className="group cursor-help">
                                <circle
                                  cx={node.x} cy={node.y} r={i === 0 ? 12 : 6}
                                  className={`transition-all duration-300 ${i === 0 ? 'fill-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : isBroken ? 'fill-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'fill-slate-700 group-hover:fill-blue-400'}`}
                                />
                                <text
                                  x={node.x} y={node.y - 12}
                                  className="text-[10px] fill-slate-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity text-center pointer-events-none"
                                  textAnchor="middle"
                                >
                                  {new URL(node.url).pathname !== '/' ? new URL(node.url).pathname.slice(-15) : 'root'}
                                </text>
                              </g>
                            );
                          })}
                        </>
                      );
                    })()}
                  </svg>

                  {/* Legend */}
                  <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-sm border border-slate-800 p-2 px-3 rounded-lg flex flex-col gap-1 text-[10px] font-semibold">
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div><span className="text-slate-300">Root Page</span></div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-700"></div><span className="text-slate-300">Healthy Link</span></div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500"></div><span className="text-slate-300">Broken Link</span></div>
                    <div className="mt-1 pt-1 border-t border-slate-800 text-slate-500 uppercase tracking-wider">Discovered: {seoSummary?.scanned || 0}</div>
                  </div>
                </div>
              )}
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