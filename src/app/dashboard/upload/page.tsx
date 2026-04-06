"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Upload as UploadIcon, FileSpreadsheet, X, CheckCircle, AlertCircle, Database, Trash2, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog, AlertDialog } from "@/components/ui/dialog";
import { useConfirm, useAlert } from "@/hooks/use-dialog";
import { formatBytes } from "@/lib/utils";
import { uploadFile, deleteDataset } from "@/lib/api";
import { useDatasetStore } from "@/store/dataset";
import { addNotification } from "@/components/layout/header";
import Link from "next/link";

interface UploadedFile {
  file: File;
  status: "uploading" | "success" | "error";
  result?: { file_id: string; rows: number; columns: string[] };
  error?: string;
}

export default function UploadPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const { datasets, isLoading, fetchDatasets } = useDatasetStore();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const confirmDialog = useConfirm();
  const alertDialog = useAlert();

  useEffect(() => {
    fetchDatasets();
  }, [fetchDatasets]);

  const handleDelete = async (id: string) => {
    const confirmed = await confirmDialog.confirm({
      title: "Delete Dataset",
      message: "This will permanently delete this dataset and all associated data.",
      confirmText: "Delete",
      variant: "danger",
    });
    if (!confirmed) return;

    setDeletingId(id);
    try {
      await deleteDataset(id);
      fetchDatasets();
      addNotification("success", "Dataset Deleted", "Dataset has been removed.", "trash");
    } catch (err: unknown) {
      alertDialog.alert({
        title: "Error",
        message: err instanceof Error ? err.message : "Failed to delete dataset",
        variant: "error",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((f) => ({
      file: f,
      status: "uploading" as const,
    }));
    setFiles((prev) => [...prev, ...newFiles]);

    for (const f of acceptedFiles) {
      try {
        const result = await uploadFile(f);
        setFiles((prev) =>
          prev.map((uf) =>
            uf.file === f ? { ...uf, status: "success", result } : uf
          )
        );
        fetchDatasets();
        addNotification("success", "Dataset Created", `${f.name} uploaded with ${result.rows.toLocaleString()} rows.`, "database");
      } catch (err: unknown) {
        setFiles((prev) =>
          prev.map((uf) =>
            uf.file === f
              ? {
                  ...uf,
                  status: "error",
                  error: err instanceof Error ? err.message : "Upload failed",
                }
              : uf
          )
        );
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
    },
    maxSize: 50 * 1024 * 1024,
  });

  const removeFile = (file: File) => {
    setFiles((prev) => prev.filter((f) => f.file !== file));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-violet-500/20">
          <UploadIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Data Upload</h1>
          <p className="text-sm text-zinc-500">Upload and manage your datasets</p>
        </div>
      </div>

      <div
        {...getRootProps()}
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-[1px] cursor-pointer transition-all duration-300 ${
          isDragActive ? "ring-4 ring-violet-400" : ""
        }`}
      >
        <div className={`bg-white rounded-3xl p-10 text-center transition-all ${isDragActive ? "bg-violet-50" : ""}`}>
          <input {...getInputProps()} />
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-violet-500/30">
            <UploadIcon className="w-8 h-8 text-white" />
          </div>
          <p className="text-xl font-semibold text-zinc-900 mb-2">
            {isDragActive ? "Drop your files here" : "Drag & drop files"}
          </p>
          <p className="text-zinc-500 mb-4">
            or click to browse — CSV, XLSX, XLS up to 50MB
          </p>
          <Button className="rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-500/30">
            <UploadIcon className="w-4 h-4 mr-2" />
            Select Files
          </Button>
        </div>
      </div>

      {files.length > 0 && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-100 to-zinc-50 p-[1px]">
          <div className="bg-white rounded-3xl p-6">
            <h3 className="text-lg font-semibold text-zinc-900 mb-4">Upload Progress</h3>
            <div className="space-y-2">
              {files.map((uf, i) => (
                <div
                  key={`${uf.file.name}-${i}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-50"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      uf.status === "success" ? "bg-emerald-100 text-emerald-600" :
                      uf.status === "error" ? "bg-red-100 text-red-600" :
                      "bg-violet-100 text-violet-600"
                    }`}>
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-zinc-900 text-sm">{uf.file.name}</p>
                      <p className="text-xs text-zinc-500">
                        {formatBytes(uf.file.size)}
                        {uf.result && ` · ${uf.result.rows.toLocaleString()} rows`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {uf.status === "uploading" && (
                      <div className="w-5 h-5 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
                    )}
                    {uf.status === "success" && (
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      </div>
                    )}
                    {uf.status === "error" && (
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                      </div>
                    )}
                    <button
                      onClick={() => removeFile(uf.file)}
                      className="p-1.5 rounded-lg hover:bg-zinc-200 text-zinc-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-[1px]">
        <div className="bg-white rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-violet-500/20">
                <Database className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-zinc-900">Your Datasets</h2>
                <p className="text-sm text-zinc-500">{datasets.length} files</p>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
            </div>
          ) : datasets.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-2xl bg-zinc-50 border-2 border-dashed border-zinc-200">
              <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-4">
                <Database className="w-8 h-8 text-zinc-400" />
              </div>
              <p className="text-zinc-500 font-medium mb-2">No datasets yet</p>
              <p className="text-sm text-zinc-400">Upload a file to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {datasets.map((dataset) => (
                <div
                  key={dataset.id}
                  className="group relative p-4 rounded-xl border-2 border-zinc-200 hover:border-violet-300 hover:bg-zinc-50 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                        <FileSpreadsheet className="w-5 h-5 text-violet-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-zinc-900 text-sm truncate" title={dataset.filename}>
                          {dataset.filename}
                        </p>
                        <p className="text-xs text-zinc-500">{formatBytes(dataset.size ?? 0)}</p>
                      </div>
                    </div>
                    <Badge variant={dataset.status === "ready" ? "success" : "warning"} className="text-xs">
                      {dataset.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-zinc-500 mb-3">
                    <span>{dataset.rows?.toLocaleString() ?? 0} rows</span>
                    <span>·</span>
                    <span>{dataset.columns?.length ?? 0} cols</span>
                  </div>
                  <div className="flex items-end justify-end pt-3 border-t border-zinc-100">
                    <button
                      onClick={() => handleDelete(dataset.id)}
                      disabled={deletingId === dataset.id}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-zinc-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onCloseAction={confirmDialog.handleCancel}
        onConfirmAction={confirmDialog.handleConfirm}
        title={confirmDialog.options.title}
        message={confirmDialog.options.message}
        confirmText={confirmDialog.options.confirmText}
        variant={confirmDialog.options.variant}
        isLoading={confirmDialog.isLoading}
      />

      <AlertDialog
        isOpen={alertDialog.isOpen}
        onCloseAction={alertDialog.handleClose}
        title={alertDialog.options.title}
        message={alertDialog.options.message}
        variant={alertDialog.options.variant}
      />
    </div>
  );
}
