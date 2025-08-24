"use client";

import { useState, useMemo } from "react";
import {
  UploadCloud,
  FileText,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [manualText, setManualText] = useState("");

  // 👇 naya API schema
  const score = result?.plagiarism?.score ?? 0;
  const scoreBadge = useMemo(() => {
    if (score >= 70)
      return <Badge variant="destructive">High Risk</Badge>;
    if (score >= 40) return <Badge variant="secondary">Moderate</Badge>;
    return (
      <Badge className="bg-emerald-600 hover:bg-emerald-600">Low</Badge>
    );
  }, [score]);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]);
  };

  const selectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const readFileTextSafe = async (f: File | null) => {
    if (!f) return "";
    try {
      return await f.text();
    } catch {
      return "";
    }
  };

  const analyze = async () => {
    if (!file && !manualText.trim()) {
      toast.error("Upload a file or paste text first");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const fileText = manualText.trim() || (await readFileTextSafe(file));

      const res = await fetch("/api/plagiarism", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentName: file?.name || "Pasted Text",
          fileType: file?.type || "text/plain",
          fileText,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success)
        throw new Error(json.error || "Analysis failed");

      setResult(json);
      toast.success("Analysis complete");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const copyJson = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    toast.success("JSON copied to clipboard");
  };

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UploadCloud className="h-5 w-5" /> Upload or Paste
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed rounded-2xl p-8 text-center hover:bg-muted/50 transition"
          >
            {file ? (
              <div className="flex flex-col items-center gap-2">
                <FileText className="h-8 w-8" />
                <div className="font-medium">{file.name}</div>
                <div className="text-sm text-muted-foreground">
                  {file.type || "unknown"} •{" "}
                  {(file.size / 1024).toFixed(1)} KB
                </div>
              </div>
            ) : (
              <>
                <p className="mb-2">
                  Drag & drop your .pdf, .docx, or .txt here
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to choose a file
                </p>
              </>
            )}
            <Input
              type="file"
              accept=".pdf,.doc,.docx,.txt,.md"
              className="mt-4 cursor-pointer"
              onChange={selectFile}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="manual">Or paste text (optional)</Label>
            <Textarea
              id="manual"
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder="Paste text here..."
              className="h-40"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button onClick={analyze} disabled={loading}>
            {loading ? (
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" /> Analyzing…
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /> Analyze
              </div>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Score Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" /> Plagiarism Score
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-4xl font-bold">{score}</div>
            {scoreBadge}
          </div>
          <Progress value={Math.min(100, Math.max(0, score))} />
          {result?.plagiarism?.reasoning && (
            <p className="text-sm text-muted-foreground mt-2">
              {result.plagiarism.reasoning}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="matches" className="w-full">
        <TabsList>
          <TabsTrigger value="matches">Matches</TabsTrigger>
          <TabsTrigger value="ai">AI Detection</TabsTrigger>
          <TabsTrigger value="json">Raw JSON</TabsTrigger>
        </TabsList>

        <TabsContent value="matches">
          <Card>
            <CardHeader>
              <CardTitle>Potential Matches</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(result?.plagiarism?.matchedSources || []).length ? (
                result.plagiarism.matchedSources.map((m: any, i: number) => (
                  <div key={i} className="rounded-xl border p-3">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{m.source}</div>
                      <Badge variant="secondary">
                        Sim {(m.similarity ?? 0).toFixed(2)}
                      </Badge>
                    </div>
                    {m.overlapSnippet && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        “{m.overlapSnippet}”
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground">
                  No overlaps found.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle>AI Detection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {result?.aiDetection ? (
                <>
                  <div className="flex items-center justify-between">
                    <div className="font-medium">
                      {result.aiDetection.isAI
                        ? "Likely AI-Generated"
                        : "Likely Human-Written"}
                    </div>
                    <Badge>
                      {Math.round(
                        (result.aiDetection.confidence ?? 0) * 100
                      )}
                      %
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {result.aiDetection.comment}
                  </p>
                </>
              ) : (
                <div className="text-muted-foreground">
                  No AI detection available.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="json">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Raw JSON</CardTitle>
              <Button variant="outline" size="sm" onClick={copyJson}>
                <Copy className="h-4 w-4 mr-1" /> Copy
              </Button>
            </CardHeader>
            <CardContent>
              <pre className="rounded-xl bg-muted p-4 overflow-auto text-xs">
                {result ? JSON.stringify(result, null, 2) : "{}"}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" /> Tips for Better Checks
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1">
          <p>
            • Prefer pasting plain text for the most accurate analysis
            (PDF/DOCX text extraction varies by browser).
          </p>
          <p>
            • Keep citations in-line (e.g., “(Smith, 2021)”) so the model
            can detect them.
          </p>
          <p>
            • Always verify high-risk matches manually before making
            decisions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
