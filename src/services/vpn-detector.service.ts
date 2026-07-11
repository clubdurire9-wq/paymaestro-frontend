// src/services/vpn-detector.service.ts

interface VPNCheckResult {
  isVPN: boolean;
  isProxy: boolean;
  isHosting: boolean;
  type: string;
  isp: string;
  org: string;
}

let cachedResult: VPNCheckResult | null = null;

export async function checkVPN(): Promise<VPNCheckResult> {
  if (cachedResult) return cachedResult;

  try {
    // Utiliser une API gratuite de détection d'IP
    const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(5000) });
    const data = await res.json();

    const result: VPNCheckResult = {
      isVPN: data.proxy === true || data.hosting === true,
      isProxy: data.proxy === true,
      isHosting: data.hosting === true,
      type: data.hosting ? 'hosting' : data.proxy ? 'proxy' : 'residential',
      isp: data.org || data.isp || 'Inconnu',
      org: data.org || 'Inconnu',
    };

    cachedResult = result;
    return result;
  } catch {
    // En cas d'erreur, on bloque quand même (sécurité maximale)
return { isVPN: false, isProxy: false, isHosting: false, type: 'local', isp: 'Localhost', org: 'Development' };
  }
}

export function blockAccessIfVPN(result: VPNCheckResult) {
  if (result.isVPN || result.isProxy || result.isHosting) {
    const div = document.createElement('div');
    div.style.cssText = 'display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;background:#1a1a2e;color:#fff;';
    const inner = document.createElement('div');
    inner.style.cssText = 'text-align:center;max-width:500px;padding:40px;';
    inner.innerHTML = `
      <h1 style="color:#e74c3c;font-size:2rem;">🚫 Accès Refusé</h1>
      <p style="margin:20px 0;color:#999;">Connexion non sécurisée détectée.</p>
      <p style="margin-top:30px;font-size:0.8rem;color:#555;">
        L'utilisation de VPN, Proxy ou serveur hébergé est interdite sur PayMaestro.<br/>
        Veuillez désactiver votre VPN et réessayer.
      </p>`;
    const typeP = document.createElement('p');
    typeP.style.cssText = 'font-size:0.9rem;color:#666;';
    typeP.appendChild(document.createTextNode(`Type : ${result.type}`));
    typeP.appendChild(document.createElement('br'));
    typeP.appendChild(document.createTextNode(`${result.isp}`));
    inner.insertBefore(typeP, inner.querySelector('p:last-child'));
    div.appendChild(inner);
    document.body.appendChild(div);
    document.body.innerHTML = '';
    document.body.appendChild(div);
    return true;
  }
  return false;
}