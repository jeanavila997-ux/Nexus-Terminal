import React, { useState } from 'react';
import { 
  X, 
  Image as ImageIcon, 
  Copy, 
  Check, 
  ExternalLink, 
  Plus, 
  Sparkles, 
  Code2, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertImageToChat: (url: string, alt: string) => void;
  onSetWorkspacePreviewImage: (url: string) => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  onClose,
  onInsertImageToChat,
  onSetWorkspacePreviewImage,
}) => {
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1000&auto=format&fit=crop&q=80'
  );
  const [imageAlt, setImageAlt] = useState('Nexus Terminal Workspace');
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [imageLoadStatus, setImageLoadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  if (!isOpen) return null;

  const presetImages = [
    {
      title: 'Terminal & Code',
      url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1000&auto=format&fit=crop&q=80',
      alt: 'Developer terminal code',
    },
    {
      title: 'Analytics Dashboard',
      url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1000&auto=format&fit=crop&q=80',
      alt: 'Data metrics dashboard',
    },
    {
      title: 'Cloud Infrastructure',
      url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1000&auto=format&fit=crop&q=80',
      alt: 'Cloud server infrastructure',
    },
    {
      title: 'AI Neural Matrix',
      url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1000&auto=format&fit=crop&q=80',
      alt: 'AI Neural Matrix and algorithms',
    },
  ];

  const htmlSnippet = `<img src="${imageUrl}" alt="${imageAlt}" class="rounded-lg border border-[#444653] w-full" />`;

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(htmlSnippet);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(imageUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleInsert = () => {
    onInsertImageToChat(imageUrl, imageAlt);
    onClose();
  };

  const handleSetAsPreview = () => {
    onSetWorkspacePreviewImage(imageUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/10 bg-[#080808] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#F27D26]">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-sm uppercase tracking-wider text-white">
                Gerenciador de Links Diretos de Imagens HTML
              </h3>
              <p className="text-xs text-white/50 font-mono">
                Adicione, valide e incorpore URLs diretas de imagens em tags <code>&lt;img&gt;</code>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white p-1.5 rounded-full hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#0a0a0a]">
          {/* Preset Images Bar */}
          <div>
            <label className="font-mono text-[10px] font-semibold text-white/50 uppercase tracking-widest block mb-2">
              Exemplos de Links Diretos Prontos
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {presetImages.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setImageUrl(preset.url);
                    setImageAlt(preset.alt);
                    setImageLoadStatus('idle');
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    imageUrl === preset.url
                      ? 'border-[#F27D26] bg-[#F27D26]/10 text-white'
                      : 'border-white/10 bg-[#0e0e0e] hover:bg-white/5 text-white/70'
                  }`}
                >
                  <span className="text-xs font-semibold block truncate text-white">{preset.title}</span>
                  <span className="text-[10px] text-white/40 font-mono truncate block">Unsplash Direct</span>
                </button>
              ))}
            </div>
          </div>

          {/* URL Input */}
          <div className="space-y-4">
            <div>
              <label className="font-mono text-[10px] font-semibold text-white/50 uppercase tracking-widest block mb-1.5">
                URL Direta da Imagem (src)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setImageLoadStatus('idle');
                  }}
                  placeholder="https://example.com/imagem.png"
                  className="flex-1 bg-[#050505] border border-white/10 focus:border-[#F27D26] rounded-xl px-3.5 py-2 text-xs text-white font-mono outline-none"
                />
                <button
                  onClick={handleCopyUrl}
                  className="px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-mono rounded-full flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copiar URL</span>
                </button>
              </div>
            </div>

            <div>
              <label className="font-mono text-[10px] font-semibold text-white/50 uppercase tracking-widest block mb-1.5">
                Texto Alternativo (alt)
              </label>
              <input
                type="text"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                placeholder="Descrição acessível da imagem"
                className="w-full bg-[#050505] border border-white/10 focus:border-[#F27D26] rounded-xl px-3.5 py-2 text-xs text-white outline-none"
              />
            </div>
          </div>

          {/* HTML Code Output */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-mono text-[10px] font-semibold text-white/50 uppercase tracking-widest flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-[#F27D26]" />
                Snippet HTML Gerado
              </label>
              <button
                onClick={handleCopyHtml}
                className="text-xs font-mono text-[#F27D26] hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedHtml ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copiado para o clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copiar Tag HTML</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-3.5 bg-[#050505] border border-white/10 rounded-xl font-mono text-xs text-[#F27D26] overflow-x-auto whitespace-pre">
              {htmlSnippet}
            </div>
          </div>

          {/* Live Preview */}
          <div>
            <label className="font-mono text-[10px] font-semibold text-white/50 uppercase tracking-widest block mb-2">
              Preview em Tempo Real
            </label>
            <div className="border border-white/10 bg-[#050505] rounded-2xl overflow-hidden relative aspect-video flex items-center justify-center">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={imageAlt}
                  onLoad={() => setImageLoadStatus('success')}
                  onError={() => setImageLoadStatus('error')}
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-xs text-white/40 font-mono">Nenhuma URL informada</span>
              )}

              {/* Status pill overlay */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/80 border border-white/10 text-[10px] font-mono text-white">
                {imageLoadStatus === 'success' && (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>URL Válida (200 OK)</span>
                  </>
                )}
                {imageLoadStatus === 'error' && (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                    <span>Erro ao carregar imagem</span>
                  </>
                )}
                {imageLoadStatus === 'idle' && <span>Carregando preview...</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-[#080808] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-full text-xs font-mono transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleSetAsPreview}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-full text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              Definir no Preview
            </button>
            <button
              onClick={handleInsert}
              className="px-5 py-2 bg-white text-black hover:bg-white/90 rounded-full text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Enviar para o Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
