"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Loader2,
  Upload,
  CheckCircle,
  XCircle,
  FileSpreadsheet,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { bulkIssueAction, type BulkIssueResponse } from "./actions";
import { CERTIFICATE_TYPES } from "@/lib/validations";

export default function BulkIssuePage() {
  const [csvContent, setCsvContent] = useState("");
  const [certType, setCertType] = useState("course_completion");
  const [skipBlockchain, setSkipBlockchain] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<BulkIssueResponse | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const submittingRef = useRef(false); // prevents double-submit

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCsvContent((ev.target?.result as string) || "");
    };
    reader.readAsText(file);
  }

  async function handleSubmit(formData: FormData) {
    if (submittingRef.current) return; // block double-submit
    submittingRef.current = true;
    setError(null);
    setLoading(true);
    setReport(null);
    formData.set("csvContent", csvContent);
    formData.set("certificateType", certType);
    formData.set("skipBlockchain", String(skipBlockchain));

    try {
      const result = await bulkIssueAction(formData);
      if ("error" in result) {
        setError(result.error);
      } else {
        setReport(result.data);
        if (result.data.failed === 0) {
          toast.success(`All ${result.data.succeeded} certificates issued.`);
        } else {
          toast.warning(`${result.data.succeeded} issued, ${result.data.failed} failed.`);
        }
      }
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  }

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      {/* Page header */}
      <div className="border-b border-border bg-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4 group"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            Back to Dashboard
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Bulk Issue Certificates
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Upload a CSV with recipient details. All share the same course,
                date, and type.
              </p>
            </div>
            <Link href="/issue">
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg gap-1.5 shrink-0"
              >
                Single Issue
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
        {/* CSV format hint */}
        <div className="mb-5 rounded-xl border border-primary/20 bg-primary/[0.03] px-5 py-4 flex items-start gap-3">
          <FileSpreadsheet className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground mb-1">
              CSV Format
            </p>
            <code className="text-xs font-mono text-muted-foreground leading-relaxed block">
              recipient_name,recipient_email
              <br />
              Rahul Sharma,rahul@example.com
              <br />
              Priya Patel,priya@example.com
            </code>
            <p className="text-xs text-muted-foreground mt-2">
              First row can be a header (auto-detected). Max 200 recipients per
              batch.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-xl bg-destructive/8 border border-destructive/20 px-4 py-3 text-sm text-destructive flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {!report && (
          <div className="rounded-2xl border border-border bg-white overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-border bg-muted/20">
              <h2 className="text-sm font-semibold text-foreground">
                Batch Details
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                These values apply to every recipient in the CSV.
              </p>
            </div>
            <div className="px-6 py-6">
              <form action={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="courseName"
                      className="text-sm font-medium text-foreground"
                    >
                      Course / Certificate Title
                    </label>
                    <Input
                      id="courseName"
                      name="courseName"
                      placeholder="e.g., B.Tech Computer Science 2025"
                      required
                      className="h-10 rounded-lg border-border"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="issueDate"
                      className="text-sm font-medium text-foreground"
                    >
                      Issue Date
                    </label>
                    <Input
                      id="issueDate"
                      name="issueDate"
                      type="date"
                      required
                      defaultValue={new Date().toISOString().split("T")[0]}
                      className="h-10 rounded-lg border-border"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="certificateType"
                    className="text-sm font-medium text-foreground"
                  >
                    Certificate Type
                  </label>
                  <Select
                    name="certificateType"
                    value={certType}
                    onValueChange={setCertType}
                  >
                    <SelectTrigger
                      id="certificateType"
                      className="h-10 rounded-lg border-border"
                    >
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {CERTIFICATE_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* CSV upload */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Recipient List (CSV)
                  </label>
                  <div className="flex items-center gap-3 mb-2">
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".csv,text/csv"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2 rounded-lg"
                      onClick={() => fileRef.current?.click()}
                    >
                      <Upload className="h-3.5 w-3.5" />
                      Upload CSV File
                    </Button>
                    {csvContent && (
                      <span className="text-xs text-emerald-600 font-medium flex items-center gap-1.5">
                        <CheckCircle className="h-3.5 w-3.5" />
                        {csvContent.trim().split(/\r?\n/).length} rows loaded
                      </span>
                    )}
                  </div>
                  <Textarea
                    placeholder={
                      "recipient_name,recipient_email\nRahul Sharma,rahul@example.com"
                    }
                    value={csvContent}
                    onChange={(e) => setCsvContent(e.target.value)}
                    rows={7}
                    className="font-mono text-xs rounded-xl border-border resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    You can also paste CSV data directly into the field above.
                  </p>
                </div>

                {/* Skip blockchain */}
                <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 px-4 py-4">
                  <input
                    id="skipBlockchain"
                    type="checkbox"
                    checked={skipBlockchain}
                    onChange={(e) => setSkipBlockchain(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-border accent-primary"
                  />
                  <div>
                    <label
                      htmlFor="skipBlockchain"
                      className="text-sm font-semibold cursor-pointer"
                    >
                      Skip blockchain registration
                    </label>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      Certificates are stored in the database only —{" "}
                      <span className="text-amber-600 font-medium">not blockchain-verifiable</span>.
                      Public verify page will show &quot;Not Found on Chain&quot;.
                      Use only to save POL gas (≈&nbsp;0.00023 POL/cert on Amoy).
                    </p>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="btn-primary-shine w-full h-11 rounded-xl gap-2 font-bold text-base"
                  disabled={loading || !csvContent.trim()}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Issuing certificates… please wait
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="h-4 w-4" />
                      Issue All Certificates
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* ── Results report ── */}
        {report && (
          <div className="space-y-5">
            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-4">
              {[
                {
                  label: "Total",
                  value: report.total,
                  color: "text-foreground",
                  bg: "bg-muted/60",
                },
                {
                  label: "Issued",
                  value: report.succeeded,
                  color: "text-emerald-600",
                  bg: "bg-emerald-50",
                  ring: "ring-1 ring-emerald-200",
                },
                {
                  label: "Failed",
                  value: report.failed,
                  color: "text-destructive",
                  bg: "bg-destructive/5",
                  ring: "ring-1 ring-destructive/15",
                },
              ].map(({ label, value, color, bg, ring }) => (
                <div
                  key={label}
                  className={`rounded-2xl border border-border bg-white p-5 text-center shadow-none ${ring ?? ""}`}
                >
                  <p
                    className={`text-3xl font-extrabold ${color}`}
                  >
                    {value}
                  </p>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mt-1">
                    {label}
                  </p>
                </div>
              ))}
            </div>

            {/* Row-by-row table */}
            <div className="rounded-2xl border border-border bg-white overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-border bg-muted/20 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">
                    Batch Report
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {report.failed > 0
                      ? `${report.failed} row(s) failed.`
                      : "All certificates issued successfully."}
                  </p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="pl-6 w-10 text-xs uppercase tracking-wide font-semibold">
                        #
                      </TableHead>
                      <TableHead className="text-xs uppercase tracking-wide font-semibold">
                        Recipient
                      </TableHead>
                      <TableHead className="text-xs uppercase tracking-wide font-semibold">
                        Email
                      </TableHead>
                      <TableHead className="text-xs uppercase tracking-wide font-semibold">
                        Status
                      </TableHead>
                      <TableHead className="text-xs uppercase tracking-wide font-semibold pr-6">
                        URI / Error
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.results.map((r) => (
                      <TableRow
                        key={r.row}
                        className="hover:bg-muted/20 transition-colors"
                      >
                        <TableCell className="pl-6 text-muted-foreground text-sm">
                          {r.row}
                        </TableCell>
                        <TableCell className="font-semibold text-sm text-foreground">
                          {r.recipientName}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {r.recipientEmail}
                        </TableCell>
                        <TableCell>
                          {r.status === "success" ? (
                            <Badge className="rounded-full bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 text-xs font-semibold">
                              <CheckCircle className="h-3 w-3" /> Issued
                            </Badge>
                          ) : (
                            <Badge className="rounded-full bg-destructive/10 text-destructive border-destructive/20 gap-1 text-xs font-semibold">
                              <XCircle className="h-3 w-3" /> Failed
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground pr-6">
                          {r.status === "success" ? r.uri : r.error}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-xl font-semibold"
                onClick={() => {
                  setReport(null);
                  setCsvContent("");
                }}
              >
                Issue Another Batch
              </Button>
              <Link href="/dashboard" className="flex-1">
                <Button className="btn-primary-shine w-full rounded-xl font-semibold">
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
