'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  Upload,
  FileText,
  CheckCircle,
  AlertTriangle,
  Clock,
  ShieldCheck,
  HelpCircle,
  FileCheck,
  Loader2,
  Scale,
  MessageSquare,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { api, KYCStatus, KYCDetails } from '@/lib/api';
import { useToast } from '@/hooks/useToast';

const NEEDS_BACK = new Set(['NATIONAL_ID', 'VOTER_CARD']);

const KYC_ATTEMPTS_KEY = 'paymaestro_kyc_attempts';

function getUsedAttempts(): number {
  if (typeof window === 'undefined') return 0;
  const stored = localStorage.getItem(KYC_ATTEMPTS_KEY);
  return stored ? parseInt(stored, 10) : 0;
}

function incrementAttempts(): void {
  const used = getUsedAttempts();
  localStorage.setItem(KYC_ATTEMPTS_KEY, String(used + 1));
}

function getRemainingAttempts(): number {
  return Math.max(0, 3 - getUsedAttempts());
}

export default function KYCPage() {
  const [kycDetails, setKycDetails] = useState<KYCDetails>({ status: 'NONE' });
  const [docType, setDocType] = useState('PASSPORT');
  const [dragActive, setDragActive] = useState(false);
  const [dragBackActive, setDragBackActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedBackFile, setSelectedBackFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const backFileInputRef = useRef<HTMLInputElement>(null);
  const { success, error } = useToast();

  useEffect(() => {
    async function loadKYC() {
      const details = await api.getKYCStatus();
      setKycDetails(details);
      if (details.documentType) setDocType(details.documentType);
    }
    loadKYC();
  }, []);

  // Poll if PENDING_AI (but show generic "24h" message)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (kycDetails.status === 'PENDING_AI') {
      interval = setInterval(async () => {
        const details = await api.getKYCStatus();
        if (details.status !== 'PENDING_AI') {
          setKycDetails(details as KYCDetails);
          clearInterval(interval);
        }
      }, 10000);
    }
    return () => clearInterval(interval);
  }, [kycDetails.status]);

  const getStatusBadge = (status: KYCStatus) => {
    switch (status) {
      case 'APPROVED':
        return <Badge variant="success">Vérifié</Badge>;
      case 'PENDING_AI':
        return <Badge variant="warning">Analyse en cours</Badge>;
      case 'PENDING_HUMAN':
        return <Badge variant="info">Revue manuelle</Badge>;
      case 'REJECTED':
        return <Badge variant="error">Rejeté</Badge>;
      case 'DISPUTED':
        return <Badge variant="warning">Contestation</Badge>;
      default:
        return <Badge variant="default">Non soumis</Badge>;
    }
  };

  const needsBack = NEEDS_BACK.has(docType);

  const handleDrag = (e: React.DragEvent, setter: (v: boolean) => void) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setter(true);
    else if (e.type === 'dragleave') setter(false);
  };

  const processFile = (file: File, setter: (f: File) => void) => {
    if (file.size > 10 * 1024 * 1024) {
      alert('Le fichier ne doit pas dépasser 10 Mo.');
      return;
    }
    setter(file);
  };

  const handleDrop = (e: React.DragEvent, setter: (f: File) => void, dragSetter: (v: boolean) => void) => {
    e.preventDefault();
    e.stopPropagation();
    dragSetter(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0], setter);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (f: File) => void) => {
    if (e.target.files?.[0]) processFile(e.target.files[0], setter);
  };

  const startUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setUploadProgress(0);

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => Math.min(prev + 15, 90));
    }, 300);

    try {
      const details = await api.uploadKYC(docType, selectedFile, needsBack ? selectedBackFile : null);
      setKycDetails(details);
      incrementAttempts();
      success('Document reçu. Nous analyserons votre dossier sous 24h.');
    } catch (e: any) {
      error(e.message || 'Erreur lors de l\'envoi du document.');
    } finally {
      clearInterval(progressInterval);
      setUploadProgress(100);
      setTimeout(() => {
        setIsUploading(false);
        setSelectedFile(null);
        setSelectedBackFile(null);
      }, 500);
    }
  };

  const startContestUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setUploadProgress(0);

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => Math.min(prev + 15, 90));
    }, 300);

    try {
      const details = await api.uploadKYC(docType, selectedFile, needsBack ? selectedBackFile : null);
      if (disputeReason.trim()) {
        await api.kyc.dispute(disputeReason.trim());
      }
      setKycDetails(details);
      incrementAttempts();
      success('Document reçu. Votre contestation a été transmise à notre équipe.');
    } catch (e: any) {
      error(e.message || 'Erreur lors de l\'envoi du document.');
    } finally {
      clearInterval(progressInterval);
      setUploadProgress(100);
      setTimeout(() => {
        setIsUploading(false);
        setSelectedFile(null);
        setSelectedBackFile(null);
        setDisputeReason('');
      }, 500);
    }
  };

  const renderUploadZone = (
    label: string,
    file: File | null,
    setFile: (f: File) => void,
    active: boolean,
    setActive: (v: boolean) => void,
    inputRef: React.RefObject<HTMLInputElement | null>,
  ) => (
    <div
      onDragEnter={(e) => handleDrag(e, setActive)}
      onDragOver={(e) => handleDrag(e, setActive)}
      onDragLeave={(e) => handleDrag(e, setActive)}
      onDrop={(e) => handleDrop(e, setFile, setActive)}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
        active ? 'border-violet-500 bg-violet-50/20' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
      }`}
    >
      <input ref={inputRef} type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, setFile)} />
      {file ? (
        <div className="space-y-2">
          <FileCheck className="w-8 h-8 text-emerald-500 mx-auto" />
          <p className="text-sm font-semibold text-slate-700">{file.name}</p>
          <p className="text-[10px] text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} Mo</p>
        </div>
      ) : (
        <>
          <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center mb-3">
            <Upload className="w-5 h-5" />
          </div>
          <p className="text-sm font-semibold text-slate-700">{label}</p>
          <p className="text-xs text-slate-400 mt-1">Cliquez ou glissez-déposez</p>
        </>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Identity Verification</h1>
          <p className="text-sm text-slate-500 mt-1">
            Vérifiez votre identité pour débloquer les limites de retraits de fonds.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">Statut :</span>
          {getStatusBadge(kycDetails.status)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
        <div className="md:col-span-3 space-y-6">
          {/* NONE - Upload form */}
          {kycDetails.status === 'NONE' && (
            <Card className="border border-slate-100 shadow-sm rounded-2xl bg-white">
              <CardContent className="p-6 sm:p-8 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Type de document</label>
                  <Select
                    options={[
                      { value: 'PASSPORT', label: 'Passeport' },
                      { value: 'NATIONAL_ID', label: 'Carte nationale d\'identité' },
                      { value: 'DRIVING_LICENSE', label: 'Carte de conducteur' },
                      { value: 'VOTER_CARD', label: 'Carte d\'électeur' },
                    ]}
                    value={docType}
                    onChange={(e) => { setDocType(e.target.value); setSelectedBackFile(null); }}
                  />
                  {needsBack && (
                    <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                      <HelpCircle className="w-3 h-3" />
                      Ce document nécessite le recto ET le verso.
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-2">Recto (face avant) *</p>
                    {renderUploadZone('Recto du document', selectedFile, setSelectedFile, dragActive, setDragActive, fileInputRef)}
                  </div>

                  {needsBack && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 mb-2">Verso (face arrière) *</p>
                      {renderUploadZone('Verso du document', selectedBackFile, setSelectedBackFile, dragBackActive, setDragBackActive, backFileInputRef)}
                    </div>
                  )}
                </div>

                {isUploading ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Loader2 className="w-4 h-4 text-violet-600 animate-spin" />
                      Envoi en cours...
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-violet-600 transition-all duration-150 rounded-full" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={startUpload}
                    disabled={!selectedFile || (needsBack && !selectedBackFile)}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4" />
                    Envoyer mon document
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* PENDING_AI - Message "24h" */}
          {kycDetails.status === 'PENDING_AI' && (
            <Card className="border-0 shadow-md bg-white overflow-hidden rounded-2xl text-center p-8 space-y-6">
              <div className="w-16 h-16 mx-auto bg-amber-50 rounded-full flex items-center justify-center text-amber-500">
                <Clock className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Document reçu</h3>
                <p className="text-sm text-slate-500 mt-3 leading-relaxed max-w-sm mx-auto">
                  Merci pour votre patience. Nous analyserons votre document et nous vous répondrons dans un délai de 24h maximum.
                </p>
              </div>
              <div className="w-full max-w-xs mx-auto h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 animate-pulse w-2/3 mx-auto rounded-full" />
              </div>
            </Card>
          )}

          {/* PENDING_HUMAN */}
          {kycDetails.status === 'PENDING_HUMAN' && (
            <Card className="border-0 shadow-md bg-white p-8 text-center space-y-4 rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-sky-50 flex items-center justify-center text-sky-600 mx-auto">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">En cours de revue</h3>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed max-w-sm mx-auto">
                  Votre document est en cours de validation manuelle. Vous recevrez une notification par email dès qu&apos;une décision sera prise.
                </p>
              </div>
            </Card>
          )}

          {/* DISPUTED */}
          {kycDetails.status === 'DISPUTED' && (
            <Card className="border-0 shadow-md bg-white p-8 text-center space-y-4 rounded-2xl border-t-4 border-t-amber-500">
              <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 mx-auto">
                <Scale className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Contestation en cours</h3>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed max-w-md mx-auto">
                  Votre contestation a été transmise à notre équipe. Un agent va examiner votre dossier manuellement et vous répondre dans les plus brefs délais.
                </p>
              </div>
            </Card>
          )}

          {/* APPROVED */}
          {kycDetails.status === 'APPROVED' && (
            <Card className="border-0 shadow-md bg-white p-8 text-center space-y-6 rounded-2xl border-t-4 border-t-emerald-500">
              <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mx-auto">
                <FileCheck className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Identité vérifiée</h3>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed max-w-md mx-auto">
                  Votre identité a été vérifiée avec succès. Vous pouvez maintenant profiter de toutes les fonctionnalités de PayMaestro.
                </p>
              </div>
              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 max-w-sm mx-auto text-left flex gap-3 text-sm text-emerald-800">
                <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Limites levées</p>
                  <p className="mt-0.5 text-emerald-700">You can now withdraw up to $2000 USD per transaction.</p>
                </div>
              </div>
            </Card>
          )}

          {/* REJECTED - with upload + contest */}
          {kycDetails.status === 'REJECTED' && (
            <>
              {getRemainingAttempts() > 0 ? (
                <Card className="border-0 shadow-md bg-white rounded-2xl border-t-4 border-t-red-500">
                  <div className="p-6 sm:p-8 space-y-6">
                    <div className="text-center space-y-3">
                      <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-red-600 mx-auto">
                        <AlertTriangle className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-800">Document non accepté</h3>
                        <p className="text-sm text-slate-500 mt-1">
                          {kycDetails.reason || 'Votre document n\'a pas pu être vérifié.'}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                      <div className="flex items-center gap-2 text-sm font-semibold text-amber-800">
                        <AlertTriangle className="w-4 h-4" />
                        Tentative {getUsedAttempts() + 1}/3
                      </div>
                      <p className="text-xs text-amber-700 leading-relaxed">
                        Avant de soumettre à nouveau, assurez-vous que :
                      </p>
                      <ul className="text-xs text-amber-700 space-y-1 list-disc list-inside">
                        <li>La photo de votre document est bien nette et lisible</li>
                        <li>Les informations de votre profil correspondent exactement à celles du document</li>
                        <li>Le document est valide (non expiré)</li>
                      </ul>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Type de document</label>
                      <Select
                        options={[
                          { value: 'PASSPORT', label: 'Passeport' },
                          { value: 'NATIONAL_ID', label: 'Carte nationale d\'identité' },
                          { value: 'DRIVING_LICENSE', label: 'Carte de conducteur' },
                          { value: 'VOTER_CARD', label: 'Carte d\'électeur' },
                        ]}
                        value={docType}
                        onChange={(e) => { setDocType(e.target.value); setSelectedBackFile(null); }}
                      />
                      {needsBack && (
                        <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                          <HelpCircle className="w-3 h-3" />
                          Ce document nécessite le recto ET le verso.
                        </p>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 mb-2">Recto (face avant) *</p>
                        {renderUploadZone('Recto du document', selectedFile, setSelectedFile, dragActive, setDragActive, fileInputRef)}
                      </div>
                      {needsBack && (
                        <div>
                          <p className="text-xs font-semibold text-slate-500 mb-2">Verso (face arrière) *</p>
                          {renderUploadZone('Verso du document', selectedBackFile, setSelectedBackFile, dragBackActive, setDragBackActive, backFileInputRef)}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-2">
                        Message (optionnel) <span className="text-slate-400 font-normal">— maximum 80 caractères</span>
                      </label>
                      <div className="relative">
                        <textarea
                          value={disputeReason}
                          onChange={(e) => {
                            if (e.target.value.length <= 80) setDisputeReason(e.target.value);
                          }}
                          placeholder="Ajoutez un message pour contester..."
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                          rows={2}
                        />
                        <span className="absolute bottom-2 right-3 text-[10px] text-slate-400">
                          {disputeReason.length}/80
                        </span>
                      </div>
                    </div>

                    {isUploading ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Loader2 className="w-4 h-4 text-violet-600 animate-spin" />
                          Envoi en cours...
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-violet-600 transition-all duration-150 rounded-full" style={{ width: `${uploadProgress}%` }} />
                        </div>
                      </div>
                    ) : (
                      <Button
                        onClick={startContestUpload}
                        disabled={!selectedFile || (needsBack && !selectedBackFile)}
                        className="w-full"
                      >
                        <Scale className="w-4 h-4" />
                        Contester et envoyer mon dossier
                      </Button>
                    )}
                  </div>
                </Card>
              ) : (
                <Card className="border-0 shadow-md bg-white p-8 text-center space-y-6 rounded-2xl border-t-4 border-t-red-600">
                  <div className="w-16 h-16 mx-auto bg-red-50 rounded-full flex items-center justify-center text-red-600">
                    <AlertTriangle className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Tentatives épuisées</h3>
                    <p className="text-sm text-slate-500 mt-3 leading-relaxed max-w-md mx-auto">
                      You have exhausted your 3 verification attempts. Your account is permanently blocked and you can no longer use PayMaestro services.
                    </p>
                  </div>
                  <div className="p-4 bg-red-50 border border-red-200 rounded-2xl max-w-sm mx-auto text-left flex gap-3 text-sm text-red-700">
                    <HelpCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Besoin d&apos;aide ?</p>
                      <p className="mt-0.5 text-red-600 text-xs">Contactez notre support client pour toute assistance.</p>
                    </div>
                  </div>
                </Card>
              )}
            </>
          )}
        </div>

        {/* Guidelines Sidebar */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border border-slate-100 shadow-sm rounded-2xl bg-slate-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-violet-600" />
                Conseils
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-4">
                <li className="flex gap-3 items-start">
                  <div className="w-5 h-5 rounded bg-white border border-slate-200 flex items-center justify-center text-[10px] font-bold text-violet-600 shrink-0 mt-0.5">1</div>
                  <div>
                    <h5 className="text-xs font-semibold text-slate-800">Photo nette</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">Évitez les photos floues ou de mauvaise qualité.</p>
                  </div>
                </li>
                <li className="flex gap-3 items-start">
                  <div className="w-5 h-5 rounded bg-white border border-slate-200 flex items-center justify-center text-[10px] font-bold text-violet-600 shrink-0 mt-0.5">2</div>
                  <div>
                    <h5 className="text-xs font-semibold text-slate-800">Document visible</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">Le document entier doit être visible à l&apos;écran.</p>
                  </div>
                </li>
                <li className="flex gap-3 items-start">
                  <div className="w-5 h-5 rounded bg-white border border-slate-200 flex items-center justify-center text-[10px] font-bold text-violet-600 shrink-0 mt-0.5">3</div>
                  <div>
                    <h5 className="text-xs font-semibold text-slate-800">Sans flash</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">Les reflets lumineux gênent la reconnaissance.</p>
                  </div>
                </li>
                <li className="flex gap-3 items-start">
                  <div className="w-5 h-5 rounded bg-white border border-slate-200 flex items-center justify-center text-[10px] font-bold text-violet-600 shrink-0 mt-0.5">4</div>
                  <div>
                    <h5 className="text-xs font-semibold text-slate-800">Document valide</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">La date d&apos;expiration ne doit pas être dépassée.</p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          {kycDetails.status === 'NONE' && needsBack && (
            <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-2xl flex gap-3 text-sm text-amber-800">
              <HelpCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
              <div>
                <p className="font-semibold">Recto et verso requis</p>
                <p className="text-xs mt-1 text-amber-700">For National ID Card and Voter Card, please provide both sides of the document.</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs text-slate-400 leading-relaxed">
            <ShieldCheck className="w-8 h-8 text-emerald-500 shrink-0" />
            <span>PayMaestro est enregistré auprès des autorités financières et s&apos;engage à protéger la confidentialité de vos données personnelles.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
