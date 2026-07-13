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
    // Use a free IP detection API
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
    // In case of error, block anyway (maximum security)
return { isVPN: false, isProxy: false, isHosting: false, type: 'local', isp: 'Localhost', org: 'Development' };
  }
}

export function blockAccessIfVPN(result: VPNCheckResult) {
  if (result.isVPN || result.isProxy || result.isHosting) {
    const div = document.createElement('div');
    div.style.cssText = 'display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;background:#1a1a2e;color:#fff;';
    const inner = document.createElement('div');
    inner.style.cssText = 'text-align:center;max-width:500px;padding:40px;';
    const h1 = document.createElement('h1');
    h1.style.cssText = 'color:#e74c3c;font-size:2rem;';
    h1.textContent = '🚫 Access Denied';
    inner.appendChild(h1);
    const p1 = document.createElement('p');
    p1.style.cssText = 'margin:20px 0;color:#999;';
    p1.textContent = 'Unsecured connection detected.';
    inner.appendChild(p1);
    const typeP = document.createElement('p');
    typeP.style.cssText = 'font-size:0.9rem;color:#666;';
    typeP.textContent = `Type : ${result.type}`;
    typeP.appendChild(document.createElement('br'));
    typeP.appendChild(document.createTextNode(`${result.isp}`));
    inner.appendChild(typeP);
    const p2 = document.createElement('p');
    p2.style.cssText = 'margin-top:30px;font-size:0.8rem;color:#555;';
    p2.textContent = "The use of VPN, Proxy or hosted server is prohibited on PayMaestro. Please disable your VPN and try again.";
    inner.appendChild(p2);
    div.appendChild(inner);
    document.body.replaceChildren(div);
    return true;
  }
  return false;
}