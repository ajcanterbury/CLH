const oldCopy = (text) => {
  const range = document.createRange();
  const sel = window.getSelection();
  range.selectNodeContents(text);
  sel.removeAllRanges();
  sel.addRange(range);
  document.execCommand('copy'); // deprecated, but some oldies still use it
};

const htmlToPlainText = (html) => {
  // skip this if it's already plain text area
  if (typeof html === 'string') return html;
  if (html.tagName === 'TEXTAREA' || html.tagName === 'INPUT') {
    return html.value;
  }

  const temporaryDiv = document.createElement('div');
  temporaryDiv.innerHTML = html.innerHTML;

  // Convert <br> to line breaks
  temporaryDiv.querySelectorAll('br').forEach((br) => {
    br.replaceWith('\n');
  });

  // Add a newline for each closing </p> tag.
  Array.from(temporaryDiv.getElementsByTagName('p')).forEach((p) => {
    if (p.nextSibling) p.after('\n\n');
  });

  // convert ul tags.
  Array.from(temporaryDiv.getElementsByTagName('li')).forEach((li) => {
    li.before('• ');
    if (li.nextSibling) li.after('\n');
  });

  // Decode HTML entities by using textContent
  return temporaryDiv.textContent.replace(/\xa0/g, ' ') || temporaryDiv.innerText.replace(/\xa0/g, ' ');
};

export const copyToClipboard = async (text) => {
  if (!navigator.clipboard) {
    oldCopy(text);
  } else {
    try {
      await navigator.clipboard.writeText(htmlToPlainText(text));
    } catch {
      // try the old way
      oldCopy(text);
    }
  }
};
