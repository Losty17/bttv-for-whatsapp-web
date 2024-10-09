/*
  Based on https://github.com/mdn/webextensions-examples/tree/master/emoji-substitution
*/

let emoteMap = tmpEmotes;

function replaceText (node) {
  
  if (node.nodeName === 'SPAN' && node.classList.contains('copyable-text')) {
    
    // Skip textarea nodes due to the potential for accidental submission
    // of substituted emoji where none was intended.
    if (node.parentNode &&
      node.parentNode.nodeName === 'TEXTAREA') {
        return;
    }

    let content = node.innerHTML;

    // Use the emoteMap for replacements.
    for (let [word, emote] of emoteMap) {
      content = content.replaceAll(word, `<img src='${emote}'/>`);
    }
    
    let cleanHTML = DOMPurify.sanitize(content, { USE_PROFILES: { html: true } });
    node.innerHTML = cleanHTML; 
  }
  else {
    // This node contains more than just text, call replaceText() on each
    // of its children.
    for (let i = 0; i < node.childNodes.length; i++) {
      replaceText(node.childNodes[i]);
    }    
  }
}

// Start the recursion from the body tag.
replaceText(document.body);

function fixCSP () {
  const cspMetaElement = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  if (!!cspMetaElement) return;
  
  const cspContent = "default-src *; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval' http://www.google.com; img-src 'self' data: blob: https://*.whatsapp.net https://*.fbcdn.net https://*.tenor.co https://*.tenor.com https://*.giphy.com https://*.ytimg.com https://*.youtube.com https://maps.googleapis.com/maps/api/staticmap https://*.google-analytics.com https://api.betterttv.net/ https://cdn.betterttv.net/";

  const metaElement = document.createElement('meta');
  metaElement.httpEquiv = "Content-Security-Policy";
  metaElement.content = cspContent;
  
  // To add this element to the document's head:
  document.head.appendChild(metaElement);
}

const observer = new MutationObserver((mutations) => {
  fixCSP();

  mutations.forEach((mutation) => {
    if (mutation.addedNodes && mutation.addedNodes.length > 0) {
      // This DOM change was new nodes being added. Run our substitution
      // algorithm on each newly added node.
      for (let i = 0; i < mutation.addedNodes.length; i++) {
        const newNode = mutation.addedNodes[i];
        replaceText(newNode);
      }
    }
  });
});
observer.observe(document.body, {
  childList: true,
  subtree: true
});
