import toast from 'react-hot-toast';

export async function copyToClipboard(text: string, label = 'Link copied!'): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const input = document.createElement('input');
      input.value = text;
      input.style.position = 'fixed';
      input.style.left = '-9999px';
      input.style.top = '-9999px';
      document.body.appendChild(input);
      input.focus();
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }
    toast.success(label, { id: 'copy-toast' });
    return true;
  } catch {
    toast.error('Failed to copy', { id: 'copy-toast' });
    return false;
  }
}
