'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  HelpCircle,
  FileCheck,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { api, KYCStatus, KYCDetails } from '@/lib/api';

export default function KYCPage() {
  const t = useTranslations('kyc');
  const tCommon = useTranslations('common');

  const [kycDetails, setKycDetails] = useState<KYCDetails>({ status: 'NONE' });
  const [docType, setDocType] = useState('passport');
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Mock upload progress
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadKYC() {
      const details = await api.getKYCStatus();
      setKycDetails(details);
    }
    loadKYC();
  }, []);

  // Poll for status updates if it is PENDING_AI
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (kycDetails.status === 'PENDING_AI') {
      interval = setInterval(async () => {
        const details = await api.getKYCStatus();
        if (details.status !== 'PENDING_AI') {
          setKycDetails(details);
          clearInterval(interval);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [kycDetails.status]);

  const getStatusBadge = (status: KYCStatus) => {
    switch (status) {
      case 'APPROVED':
        return <Badge variant="success">{t(`status.${status}`)}</Badge>;
      case 'PENDING_AI':
        return <Badge variant="warning">{t(`status.${status}`)}</Badge>;
      case 'PENDING_HUMAN':
        return <Badge variant="info">{t(`status.${status}`)}</Badge>;
      case 'REJECTED':
        return <Badge variant="error">{t(`status.${status}`)}</Badge>;
      default:
        return <Badge variant="default">{t(`status.NONE`)}</Badge>;
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      alert(t('upload.maxSize'));
      return;
    }
    setSelectedFile(file);
    startMockUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const startMockUpload = (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          handleUploadComplete(file);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleUploadComplete = async (file: File) => {
    const details = await api.uploadKYC(docType, file);
    setKycDetails(details);
    setIsUploading(false);
    setSelectedFile(null);
  };

  const triggerRetry = async () => {
    const details = await api.resetKYC();
    setKycDetails(details);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{t('title')}</h1>
          <p className="text-sm text-slate-500 mt-1">
            Vérifiez votre identité pour débloquer les limites de retraits de fonds.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">Statut actuel :</span>
          {getStatusBadge(kycDetails.status)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
        {/* Document submission and statuses */}
        <div className="md:col-span-3 space-y-6">
          {kycDetails.status === 'NONE' && (
            <Card className="border border-slate-100 shadow-sm rounded-2xl bg-white">
              <CardContent className="p-6 sm:p-8 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    {t('selectType.title')}
                  </label>
                  <Select
                    options={[
                      { value: 'passport', label: t('selectType.passport') },
                      { value: 'nationalId', label: t('selectType.nationalId') },
                      { value: 'drivingLicense', label: t('selectType.drivingLicense') },
                      { value: 'voterCard', label: t('selectType.voterCard') }
                    ]}
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                  />
                </div>

                {/* Upload zone */}
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`
                    border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200
                    ${dragActive 
                      ? 'border-violet-500 bg-violet-50/20' 
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    }
                  `}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                  />

                  {isUploading ? (
                    <div className="space-y-4 w-full max-w-[200px]">
                      <Loader2 className="w-8 h-8 text-violet-600 animate-spin mx-auto" />
                      <p className="text-xs font-semibold text-slate-500">Téléchargement...</p>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-violet-600 transition-all duration-150"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center mb-4">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-semibold text-slate-800">{t('upload.dragDrop')}</p>
                      <p className="text-xs text-slate-400 mt-1">{t('upload.or')} <span className="text-violet-600 font-medium hover:underline">{t('upload.browse')}</span></p>
                      <p className="text-[10px] text-slate-400 mt-4 leading-relaxed">
                        {t('upload.accepted')}<br />
                        {t('upload.maxSize')}
                      </p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {kycDetails.status === 'PENDING_AI' && (
            <Card className="border-0 shadow-md bg-white overflow-hidden rounded-2xl text-center p-8 space-y-6">
              <div className="relative w-16 h-16 mx-auto bg-amber-50 rounded-full flex items-center justify-center text-amber-500 overflow-hidden">
                <Clock className="w-8 h-8 animate-pulse" />
                {/* Simulated scan bar */}
                <div className="absolute left-0 right-0 h-0.5 bg-amber-400/80 top-0 animate-bounce" style={{ animationDuration: '2s' }} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">{t('analyzing')}</h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed max-w-sm mx-auto">
                  Notre intelligence artificielle analyse votre pièce d&apos;identité. Cette opération prend généralement moins d&apos;une minute. Veuillez patienter.
                </p>
              </div>
              <div className="w-full max-w-xs mx-auto h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 animate-[pulse_1.5s_infinite] w-2/3 mx-auto rounded-full" />
              </div>
            </Card>
          )}

          {kycDetails.status === 'PENDING_HUMAN' && (
            <Card className="border-0 shadow-md bg-white p-8 text-center space-y-4 rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-sky-50 flex items-center justify-center text-sky-600 mx-auto">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">En cours de revue</h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed max-w-sm mx-auto">
                  Votre document est en cours de validation manuelle par l&apos;un de nos agents de sécurité. Vous recevrez une notification par email d&apos;ici quelques heures.
                </p>
              </div>
            </Card>
          )}

          {kycDetails.status === 'APPROVED' && (
            <Card className="border-0 shadow-md bg-white p-8 text-center space-y-6 rounded-2xl border-t-4 border-t-emerald-500">
              <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mx-auto">
                <FileCheck className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">{t('approved.title')}</h3>
                <p className="text-sm text-slate-500 mt-1.5 leading-relaxed max-w-md mx-auto">
                  {t('approved.message')}
                </p>
              </div>
              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 max-w-sm mx-auto text-left flex gap-3 text-xs text-emerald-800">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Limites levées</p>
                  <p className="mt-0.5 text-emerald-700">Vous pouvez désormais retirer jusqu&apos;à $2000 USD par transaction Mobile Money.</p>
                </div>
              </div>
            </Card>
          )}

          {kycDetails.status === 'REJECTED' && (
            <Card className="border-0 shadow-md bg-white p-8 text-center space-y-6 rounded-2xl border-t-4 border-t-red-500">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-red-600 mx-auto">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">{t('rejected.title')}</h3>
                <p className="text-sm text-slate-500 mt-1.5 leading-relaxed max-w-md mx-auto">
                  {t('rejected.message', { reason: kycDetails.reason || 'Document non lisible ou expiré' })}
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={triggerRetry}
                className="max-w-xs mx-auto"
              >
                {t('rejected.retry')}
              </Button>
            </Card>
          )}
        </div>

        {/* Guidelines Sidebar */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border border-slate-100 shadow-sm rounded-2xl bg-slate-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-violet-600" />
                {t('upload.tips.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-4">
                <li className="flex gap-3 items-start">
                  <div className="w-5 h-5 rounded bg-white border border-slate-200 flex items-center justify-center text-[10px] font-bold text-violet-600 shrink-0 mt-0.5">1</div>
                  <div>
                    <h5 className="text-xs font-semibold text-slate-800">{t('upload.tips.clear')}</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">Évitez les photos floues ou de mauvaise qualité.</p>
                  </div>
                </li>
                <li className="flex gap-3 items-start">
                  <div className="w-5 h-5 rounded bg-white border border-slate-200 flex items-center justify-center text-[10px] font-bold text-violet-600 shrink-0 mt-0.5">2</div>
                  <div>
                    <h5 className="text-xs font-semibold text-slate-800">{t('upload.tips.corners')}</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">Le document entier doit être visible à l&apos;écran.</p>
                  </div>
                </li>
                <li className="flex gap-3 items-start">
                  <div className="w-5 h-5 rounded bg-white border border-slate-200 flex items-center justify-center text-[10px] font-bold text-violet-600 shrink-0 mt-0.5">3</div>
                  <div>
                    <h5 className="text-xs font-semibold text-slate-800">{t('upload.tips.noFlash')}</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">Le flash ou les reflets lumineux gênent la reconnaissance optique (OCR).</p>
                  </div>
                </li>
                <li className="flex gap-3 items-start">
                  <div className="w-5 h-5 rounded bg-white border border-slate-200 flex items-center justify-center text-[10px] font-bold text-violet-600 shrink-0 mt-0.5">4</div>
                  <div>
                    <h5 className="text-xs font-semibold text-slate-800">{t('upload.tips.valid')}</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">La date d&apos;expiration de votre document ne doit pas être dépassée.</p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          <div className="flex items-center gap-2 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] text-slate-400 leading-relaxed">
            <ShieldCheck className="w-8 h-8 text-emerald-500 shrink-0" />
            <span>PayMaestro est enregistré auprès des autorités financières et s&apos;engage à protéger la confidentialité de vos données personnelles.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
