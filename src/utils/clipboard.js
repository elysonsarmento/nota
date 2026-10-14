/**
 * Utilitário de cópia para a área de transferência com fallback robusto
 * Compatível com Safari iOS, Chrome e ambientes sem HTTPS.
 */
export async function copyToClipboardUniversal(text) {
  if (!text) return false;

  // Tentativa 1: Navigator Clipboard API se disponível e em contexto seguro
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('Navigator clipboard falhou, tentando fallback:', err);
    }
  }

  // Tentativa 2: Fallback tradicional com textarea selecionado (funciona 100% no Safari HTTP)
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // Evita scroll da tela no iOS
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    textArea.setAttribute('readonly', '');

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, 999999); // Para Safari iOS

    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Fallback execCommand copy falhou:', err);
    return false;
  }
}
