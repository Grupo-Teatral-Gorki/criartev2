"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import Button from "@/app/components/Button";
import { HelpVideo, HelpVideoService } from "@/app/services/helpVideoService";
import { Trash2, GripVertical, Pencil, Upload, RefreshCw } from "lucide-react";
import Toast from "@/app/components/Toast";

export default function AdminHelpVideos() {
  const { dbUser } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [videos, setVideos] = useState<HelpVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [replacingId, setReplacingId] = useState<string | null>(null);
  const [replaceProgress, setReplaceProgress] = useState(0);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const replacingVideoRef = useRef<HelpVideo | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const isAdmin =
    Array.isArray(dbUser?.userRole) && dbUser.userRole.includes("admin");

  useEffect(() => {
    if (dbUser && !isAdmin) {
      router.push("/home");
    }
  }, [dbUser, isAdmin, router]);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const data = await HelpVideoService.getAll();
      setVideos(data);
    } catch (error) {
      console.error("Error loading videos:", error);
    } finally {
      setLoading(false);
    }
  };

  const toast = (message: string, type: "success" | "error") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast("Selecione um arquivo de vídeo.", "error");
      return;
    }
    if (!title.trim()) {
      toast("O título é obrigatório.", "error");
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      await HelpVideoService.upload(
        selectedFile,
        title.trim(),
        description.trim(),
        (progress) => setUploadProgress(progress)
      );
      toast("Vídeo enviado com sucesso!", "success");
      setTitle("");
      setDescription("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await loadVideos();
    } catch (error) {
      console.error("Upload error:", error);
      toast("Erro ao enviar o vídeo.", "error");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (video: HelpVideo) => {
    if (!video.id) return;
    if (!confirm(`Deseja realmente excluir o vídeo "${video.title}"?`)) return;

    try {
      await HelpVideoService.delete(video.id, video.storagePath);
      toast("Vídeo excluído com sucesso!", "success");
      await loadVideos();
    } catch (error) {
      console.error("Delete error:", error);
      toast("Erro ao excluir o vídeo.", "error");
    }
  };

  const handleEdit = (video: HelpVideo) => {
    setEditingId(video.id || null);
    setEditTitle(video.title);
    setEditDescription(video.description);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    if (!editTitle.trim()) {
      toast("O título é obrigatório.", "error");
      return;
    }

    try {
      await HelpVideoService.update(editingId, {
        title: editTitle.trim(),
        description: editDescription.trim(),
      });
      toast("Vídeo atualizado com sucesso!", "success");
      setEditingId(null);
      await loadVideos();
    } catch (error) {
      console.error("Update error:", error);
      toast("Erro ao atualizar o vídeo.", "error");
    }
  };

  const handleReplaceClick = (video: HelpVideo) => {
    replacingVideoRef.current = video;
    replaceInputRef.current?.click();
  };

  const handleReplaceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const video = replacingVideoRef.current;
    if (!file || !video?.id) return;

    try {
      setReplacingId(video.id);
      setReplaceProgress(0);
      await HelpVideoService.replaceVideo(
        video.id,
        video.storagePath,
        file,
        (progress) => setReplaceProgress(progress)
      );
      toast("Vídeo substituído com sucesso!", "success");
      await loadVideos();
    } catch (error) {
      console.error("Replace error:", error);
      toast("Erro ao substituir o vídeo.", "error");
    } finally {
      setReplacingId(null);
      setReplaceProgress(0);
      replacingVideoRef.current = null;
      if (replaceInputRef.current) replaceInputRef.current.value = "";
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const updated = [...videos];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    try {
      await Promise.all(
        updated.map((v, i) =>
          v.id ? HelpVideoService.update(v.id, { order: i }) : Promise.resolve()
        )
      );
      setVideos(updated);
    } catch (error) {
      console.error("Reorder error:", error);
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === videos.length - 1) return;
    const updated = [...videos];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    try {
      await Promise.all(
        updated.map((v, i) =>
          v.id ? HelpVideoService.update(v.id, { order: i }) : Promise.resolve()
        )
      );
      setVideos(updated);
    } catch (error) {
      console.error("Reorder error:", error);
    }
  };

  if (!dbUser || !isAdmin) return null;

  return (
    <div className="w-full overflow-y-auto flex flex-col px-4 sm:px-8 lg:px-36 pb-12">
      <div className="w-full flex flex-col sm:flex-row items-center gap-4 sm:gap-12 rounded-2xl bg-white/85 dark:bg-slate-800/80 backdrop-blur-xl border border-white/40 dark:border-slate-700/60 shadow-soft p-4 mt-4 mb-6">
        <Button
          label="VOLTAR"
          onClick={() => router.push("/admin")}
          size="medium"
        />
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
          Gerenciar Vídeos de Ajuda
        </h2>
      </div>

      {/* Upload Form */}
      <div className="rounded-2xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-soft p-6 mb-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Enviar Novo Vídeo
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Título *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Como criar um projeto"
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Arquivo de Vídeo *
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-100 file:text-primary-700 dark:file:bg-primary-900/40 dark:file:text-primary-300"
            />
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Descrição
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve descrição do conteúdo do vídeo..."
              rows={3}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>
        </div>

        {uploading && (
          <div className="mt-4">
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
              <div
                className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Enviando... {Math.round(uploadProgress)}%
            </p>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleUpload}
            disabled={uploading || !selectedFile || !title.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Upload className="w-4 h-4" />
            {uploading ? "Enviando..." : "Enviar Vídeo"}
          </button>
        </div>
      </div>

      {/* Videos List */}
      <div className="rounded-2xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-soft p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Vídeos Cadastrados ({videos.length})
        </h3>

        {loading ? (
          <p className="text-slate-500 dark:text-slate-400">Carregando...</p>
        ) : videos.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400">
            Nenhum vídeo cadastrado ainda.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {videos.map((video, index) => (
              <div
                key={video.id}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50"
              >
                {/* Reorder */}
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 transition-colors"
                    title="Mover para cima"
                  >
                    <GripVertical className="w-4 h-4 rotate-180" />
                  </button>
                  <button
                    onClick={() => handleMoveDown(index)}
                    disabled={index === videos.length - 1}
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 transition-colors"
                    title="Mover para baixo"
                  >
                    <GripVertical className="w-4 h-4" />
                  </button>
                </div>

                {/* Video preview */}
                <div className="w-full sm:w-48 flex-shrink-0">
                  <video
                    src={video.videoUrl}
                    className="w-full rounded-lg aspect-video object-cover bg-black"
                    muted
                    preload="metadata"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  {editingId === video.id ? (
                    <div className="flex flex-col gap-2">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        rows={2}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveEdit}
                          className="px-3 py-1 rounded-lg bg-primary-600 text-white text-sm hover:bg-primary-700 transition-colors"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {video.title}
                      </h4>
                      {video.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                          {video.description}
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* Actions */}
                {editingId !== video.id && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleReplaceClick(video)}
                      disabled={replacingId === video.id}
                      className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-50"
                      title="Substituir vídeo"
                    >
                      <RefreshCw className={`w-4 h-4 ${replacingId === video.id ? "animate-spin" : ""}`} />
                    </button>
                    <button
                      onClick={() => handleEdit(video)}
                      className="p-2 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(video)}
                      className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {replacingId === video.id && (
                  <div className="w-full mt-2">
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${replaceProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hidden file input for video replacement */}
      <input
        ref={replaceInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleReplaceFile}
      />

      <Toast
        message={toastMessage}
        show={showToast}
        type={toastType}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}
