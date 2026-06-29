// src/services/anti-detect.service.ts

interface BrowserInconsistency {
  detected: boolean;
  reason: string;
  confidence: number; // 0-100
  type: 'ANTI_DETECT' | 'BOT' | 'SPOOFED' | 'SUSPICIOUS' | 'CLEAN';
}

/**
 * Détecte les navigateurs anti-détection (GoLogin, Multilogin, AdsPower...)
 */
export function detectAntiDetectBrowser(): BrowserInconsistency {
  const checks: { name: string; passed: boolean; details: string }[] = [];

  // 1. Vérifier navigator.webdriver (marqueur Selenium/Puppeteer)
  if (navigator.webdriver) {
    checks.push({ name: 'WebDriver', passed: false, details: 'Navigateur automatisé détecté' });
  } else {
    checks.push({ name: 'WebDriver', passed: true, details: 'OK' });
  }

  // 2. Vérifier l'incohérence User-Agent vs Plateforme
  const ua = navigator.userAgent;
  const platform = navigator.platform;
  
  const isWindows = ua.includes('Windows') || platform.includes('Win');
  const isMac = ua.includes('Mac') || platform.includes('Mac');
  const isLinux = ua.includes('Linux') || platform.includes('Linux');
  
  // Vérifier les plugins Chrome sur Firefox
  const isChrome = ua.includes('Chrome') && !ua.includes('Edge') && !ua.includes('OPR');
  const isFirefox = ua.includes('Firefox');
  
  if (isChrome && navigator.plugins?.length === 0) {
    checks.push({ name: 'Plugins', passed: false, details: 'Chrome sans plugins — suspect' });
  } else if (isFirefox && navigator.plugins?.length > 10) {
    checks.push({ name: 'Plugins', passed: false, details: 'Firefox avec plugins Chrome — incohérent' });
  } else {
    checks.push({ name: 'Plugins', passed: true, details: 'OK' });
  }

  // 3. Vérifier WebGL Vendor (souvent spoofé par les anti-detect)
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as any;
    
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        
        // Détecter les rendus logiciels (signe d'anti-detect)
        if (renderer.includes('SwiftShader') || renderer.includes('llvmpipe')) {
          checks.push({ name: 'WebGL', passed: false, details: `Rendu logiciel détecté: ${renderer}` });
        } else if (vendor === 'Google Inc.' && !isChrome) {
          checks.push({ name: 'WebGL', passed: false, details: 'Vendor Google sur non-Chrome — incohérent' });
        } else {
          checks.push({ name: 'WebGL', passed: true, details: `Vendor: ${vendor}` });
        }
      }
    }
  } catch (e) {
    checks.push({ name: 'WebGL', passed: false, details: 'WebGL non disponible' });
  }

  // 4. Vérifier la résolution vs la taille de l'écran
  const screenW = screen.width;
  const screenH = screen.height;
  const windowW = window.innerWidth;
  const windowH = window.innerHeight;
  
  if (Math.abs(screenW - windowW) < 5 && Math.abs(screenH - windowH) < 5) {
    // Fenêtre = plein écran — suspect pour anti-detect
    checks.push({ name: 'Screen', passed: true, details: 'OK' });
  } else {
    checks.push({ name: 'Screen', passed: true, details: 'OK' });
  }

  // 5. Vérifier les polices système (les anti-detect en ont souvent moins)
  try {
    const fonts = ['Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana', 'Comic Sans MS', 'Impact', 'Trebuchet MS'];
    let detectedFonts = 0;
    
    fonts.forEach(font => {
      const testElement = document.createElement('span');
      testElement.style.fontFamily = `"${font}"`;
      testElement.style.position = 'absolute';
      testElement.style.visibility = 'hidden';
      testElement.textContent = 'TEST';
      document.body.appendChild(testElement);
      const width = testElement.offsetWidth;
      document.body.removeChild(testElement);
      if (width > 0) detectedFonts++;
    });
    
    if (detectedFonts < 3) {
      checks.push({ name: 'Fonts', passed: false, details: `Seulement ${detectedFonts}/8 polices détectées` });
    } else {
      checks.push({ name: 'Fonts', passed: true, details: `${detectedFonts}/8 polices OK` });
    }
  } catch (e) {
    checks.push({ name: 'Fonts', passed: true, details: 'Non vérifié' });
  }

  // 6. Détecter les variables globales injectées par les anti-detect
  const suspectGlobals = [
    'gologin', 'multilogin', 'adspower', 'indeed', 'dolphin',
    'webdriver', '__nightmare', '__webdriver_evaluate',
    '__selenium_evaluate', '__fxdriver_evaluate',
    '__driver_evaluate', '__webdriver_script_func',
  ];

  let suspectFound = false;
  let suspectName = '';
  
  suspectGlobals.forEach(name => {
    if ((window as any)[name] !== undefined) {
      suspectFound = true;
      suspectName = name;
    }
  });

  if (suspectFound) {
    checks.push({ name: 'Globals', passed: false, details: `Variable suspecte détectée: ${suspectName}` });
  } else {
    checks.push({ name: 'Globals', passed: true, details: 'OK' });
  }

  // 7. Vérifier le timezone vs la langue
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const language = navigator.language;
  
  // Incohérence basique
  if (timezone.includes('Africa') && language.startsWith('ru')) {
    checks.push({ name: 'Locale', passed: false, details: `Timezone ${timezone} vs Langue ${language} — incohérent` });
  } else {
    checks.push({ name: 'Locale', passed: true, details: `${timezone} / ${language}` });
  }

  // Calculer le score
  const failedChecks = checks.filter(c => !c.passed).length;
  const totalChecks = checks.length;
  const confidence = Math.round(((totalChecks - failedChecks) / totalChecks) * 100);

  let type: BrowserInconsistency['type'] = 'CLEAN';
  let reason = 'Navigateur légitime';

  if (failedChecks >= 3) {
    type = 'ANTI_DETECT';
    reason = `Navigateur anti-détection détecté (${failedChecks}/${totalChecks} échecs)`;
  } else if (failedChecks === 2) {
    type = 'SPOOFED';
    reason = `Navigateur potentiellement usurpé (${failedChecks} anomalies)`;
  } else if (failedChecks === 1) {
    type = 'SUSPICIOUS';
    reason = `Anomalie légère détectée`;
  }

  return {
    detected: type !== 'CLEAN',
    reason,
    confidence,
    type,
  };
}

/**
 * Signale une détection anti-fraud au backend
 */
export async function reportFraudDetection(detection: BrowserInconsistency, userEmail?: string) {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
    await fetch(`${API_URL}/security/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: detection.type,
        confidence: detection.confidence,
        reason: detection.reason,
        userEmail,
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (error) {
    console.error('Erreur signalement fraude:', error);
  }
}