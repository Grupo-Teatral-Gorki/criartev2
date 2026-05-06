"use client";

import { useEffect, useState } from "react";
import { HelpVideo, HelpVideoService } from "@/app/services/helpVideoService";
import { CirclePlay, Phone, Mail } from "lucide-react";

export default function HelpPage() {
  const [videos, setVideos] = useState<HelpVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    HelpVideoService.getAll()
      .then(setVideos)
      .catch((err) => console.error("Error loading help videos:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="w-full overflow-y-auto flex flex-col px-4 sm:px-8 lg:px-36 pb-12">
      <div className="w-full flex flex-col items-center rounded-2xl bg-white/85 dark:bg-slate-800/80 backdrop-blur-xl border border-white/40 dark:border-slate-700/60 shadow-soft p-6 mt-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
          Central de Ajuda
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2 text-center">
          Assista aos vídeos abaixo para aprender a usar o CRIARTE
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
        </div>
      ) : videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-soft">
          <CirclePlay className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
          <p className="text-lg text-slate-500 dark:text-slate-400">
            Nenhum vídeo disponível no momento.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {videos.map((video) => (
            <div
              key={video.id}
              className="rounded-2xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-soft overflow-hidden flex flex-col"
            >
              <div className="relative w-full aspect-video bg-black">
                <video
                  src={video.videoUrl}
                  controls
                  controlsList="nodownload noplaybackrate"
                  disablePictureInPicture
                  onContextMenu={(e) => e.preventDefault()}
                  className="w-full h-full object-contain"
                  preload="metadata"
                />
              </div>
              <div className="p-4 flex-1">
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  {video.title}
                </h2>
                {video.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 whitespace-pre-line line-clamp-3">
                    {video.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Contact section */}
      <div className="mt-8 rounded-2xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-soft p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
          Ainda precisa de ajuda?
        </h3>
        <div className="flex flex-col sm:flex-row gap-4 text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-primary-600" />
            <span>WhatsApp: (16) 98142-3000</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-primary-600" />
            <span>Tel: (16) 3421-9152</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary-600" />
            <span>criarte@grupoteatralgorki.com</span>
          </div>
        </div>
      </div>
    </div>
  );
}
