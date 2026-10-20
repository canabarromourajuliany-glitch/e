import { useState } from 'react';
import { ShieldAlert, MapPin, FileText, Camera, Check, AlertTriangle, EyeOff, Eye } from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';

export function ReportsScreen() {
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [reportType, setReportType] = useState('maus-tratos');
  const [photos, setPhotos] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [anonymous, setAnonymous] = useState(false);
  const [errors, setErrors] = useState<{ address?: string; description?: string }>({});

  const handlePhotoClick = () => {
    const colors = ['#34d399', '#60a5fa', '#fb923c', '#facc15'];
    const color = colors[photos.length % colors.length];
    setPhotos([...photos, color]);
  };

  const handleSubmit = () => {
    const newErrors: typeof errors = {};
    if (!address.trim()) newErrors.address = 'O endereço é obrigatório';
    if (!description.trim()) newErrors.description = 'A descrição é obrigatória';
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      setSubmitted(true);
      setAddress('');
      setDescription('');
      setPhotos([]);
      setReportType('maus-tratos');
      setAnonymous(false);
      setTimeout(() => setSubmitted(false), 4000);
    }
  };

  const reportTypes = [
    { id: 'maus-tratos', label: 'Maus-tratos' },
    { id: 'abandono', label: 'Abandono' },
    { id: 'venda-irregular', label: 'Venda irregular' },
    { id: 'outro', label: 'Outro' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-error-50/30 to-white pb-24">
      <AppHeader title="Denúncias" subtitle="Reporte maus-tratos com segurança" />

      <div className="px-4 pt-4">
        {submitted && (
          <div className="mb-4 bg-success-50 border border-success-200 rounded-2xl p-4 flex items-center gap-3 animate-scale-in">
            <div className="bg-success-500 p-2 rounded-full">
              <Check size={18} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-success-800">Denúncia registrada!</p>
              <p className="text-xs text-success-600">
                {anonymous ? 'Denúncia anônima enviada. ' : ''}Nossa equipe vai analisar o caso em breve.
              </p>
            </div>
          </div>
        )}

        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-start gap-2">
          <AlertTriangle size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-700 leading-relaxed">
            Sua identidade será preservada. Em casos de emergência, ligue para <strong>190</strong>.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-5">
          <button
            onClick={() => setAnonymous(!anonymous)}
            className={`w-full flex items-center justify-between p-3.5 rounded-xl transition-all duration-200 border-2 ${
              anonymous
                ? 'bg-secondary-50 border-secondary-300'
                : 'bg-gray-50 border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg transition-colors ${anonymous ? 'bg-secondary-500' : 'bg-gray-200'}`}>
                {anonymous ? <EyeOff size={18} className="text-white" /> : <Eye size={18} className="text-gray-500" />}
              </div>
              <div className="text-left">
                <p className={`text-sm font-semibold ${anonymous ? 'text-secondary-700' : 'text-gray-600'}`}>
                  Denúncia Anônima
                </p>
                <p className="text-xs text-gray-400">
                  {anonymous ? 'Seus dados não serão compartilhados' : 'Toque para ocultar sua identidade'}
                </p>
              </div>
            </div>
            <div className={`w-12 h-6 rounded-full transition-all duration-300 relative ${anonymous ? 'bg-secondary-500' : 'bg-gray-300'}`}>
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300 ${anonymous ? 'left-6' : 'left-0.5'}`} />
            </div>
          </button>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Tipo de Ocorrência</label>
            <div className="grid grid-cols-2 gap-2">
              {reportTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setReportType(type.id)}
                  className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    reportType === type.id
                      ? 'bg-primary-500 text-white shadow-sm'
                      : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <MapPin size={16} className="text-primary-500" /> Endereço da Ocorrência
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ex: Rua das Acácias, 45 — bairro, cidade"
              rows={2}
              className={`w-full px-4 py-3 rounded-xl text-sm resize-none transition-all duration-200 ${
                errors.address
                  ? 'border-2 border-error-400 bg-error-50/30'
                  : 'border border-gray-200 focus:border-primary-400 focus:bg-primary-50/20'
              } focus:outline-none`}
            />
            {errors.address && <p className="text-xs text-error-500 mt-1">{errors.address}</p>}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <FileText size={16} className="text-primary-500" /> Descrição da Ocorrência
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o que você presenciou: tipo de animal, condição, frequência, etc."
              rows={5}
              className={`w-full px-4 py-3 rounded-xl text-sm resize-none transition-all duration-200 ${
                errors.description
                  ? 'border-2 border-error-400 bg-error-50/30'
                  : 'border border-gray-200 focus:border-primary-400 focus:bg-primary-50/20'
              } focus:outline-none`}
            />
            {errors.description && <p className="text-xs text-error-500 mt-1">{errors.description}</p>}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Camera size={16} className="text-primary-500" /> Anexar Fotos
            </label>
            <div className="flex gap-3 flex-wrap">
              {photos.map((color, i) => (
                <div
                  key={i}
                  className="w-20 h-20 rounded-xl flex items-center justify-center relative animate-scale-in"
                  style={{ backgroundColor: color + '20' }}
                >
                  <Camera size={24} style={{ color }} />
                </div>
              ))}
              {photos.length < 5 && (
                <button
                  onClick={handlePhotoClick}
                  className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-primary-400 hover:bg-primary-50/30 transition-all duration-200"
                >
                  <div className="flex flex-col items-center gap-1">
                    <Camera size={20} className="text-gray-400" />
                    <span className="text-[10px] text-gray-400">Adicionar</span>
                  </div>
                </button>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-2">{photos.length}/5 fotos anexadas</p>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full py-3.5 rounded-xl bg-error-500 text-white font-semibold text-sm shadow-md shadow-error-200 hover:bg-error-600 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <ShieldAlert size={18} />
            Enviar Denúncia
          </button>
        </div>
      </div>
    </div>
  );
}
