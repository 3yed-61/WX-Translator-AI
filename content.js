
/* ========================================
   Text Selection Translation (Context Menu)
   ======================================== */
// Function to add context menu
let isMouseDown = false;
let selectionTimer = null;
const SELECTION_DELAY = 300; // ms
let lastSelectedText = ''; // Store the last selected text

// Track mouse down state
document.addEventListener('mousedown', function(event) {
    // Don't remove the button if clicking on it
    if (event.target.id === 'translate-selected-text') {
        return;
    }
    
    isMouseDown = true;
    
    // Clear any existing selection timer
    if (selectionTimer) {
        clearTimeout(selectionTimer);
        selectionTimer = null;
    }
    
    // Remove any existing translate button when starting a new selection
    let translateButton = document.getElementById('translate-selected-text');
    if (translateButton) {
        translateButton.remove();
    }
});

// Handle mouse up - this is when we'll check for selection
document.addEventListener('mouseup', function(event) {
    // Don't process if clicking on the translate button
    if (event.target.id === 'translate-selected-text') {
        return;
    }
    
    isMouseDown = false;
    
    // Capture the Shift key state at mouseup.
    const shiftKeyPressed = event.shiftKey;
    
    // Wait a moment after mouse up to allow browser to complete selection
    // This is especially important for triple-clicks
    selectionTimer = setTimeout(() => {
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();
        
        if (selectedText) {
            // Check if this might be a paragraph selection (from triple-click)
            enhanceSelectionIfNeeded(selection);
            
            // Get the potentially enhanced selection
            const enhancedText = window.getSelection().toString().trim();
            lastSelectedText = enhancedText; // Store for later use
            
            // Show the translation button only if Shift key is not pressed
            if (!shiftKeyPressed) {
                // Compute bounding rectangle of the selection
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();
                // Position the button fixed at the bottom left of the selected text
                showTranslationButton({ clientX: rect.left, clientY: rect.bottom }, enhancedText);
            }
        }
    }, SELECTION_DELAY);
});

// Function to enhance selection if it appears to be from a triple-click
function enhanceSelectionIfNeeded(selection) {
    // Disabled to maintain default browser triple-click behavior
    return;
}

// Function to show the translation button at the bottom of the selected text
function showTranslationButton(event, selectedText) {
    if (!selectedText) return;
    
    // Remove any existing button first
    let existingButton = document.getElementById('translate-selected-text');
    if (existingButton) {
        existingButton.remove();
    }
    
    // Create a new button
    let translateButton = document.createElement('button');
    translateButton.id = 'translate-selected-text';
    translateButton.textContent = 'Translate';
    translateButton.style.position = 'fixed';
    // Use the provided coordinates (bottom of selection)
    translateButton.style.top = event.clientY + 'px';
    translateButton.style.left = event.clientX + 'px';
    translateButton.style.zIndex = '1000';
    translateButton.style.backgroundColor = '#4CAF50';
    translateButton.style.color = 'white';
    translateButton.style.padding = '5px 10px';
    translateButton.style.border = 'none';
    translateButton.style.borderRadius = '5px';
    translateButton.style.cursor = 'pointer';
    
    // Prevent the button from being removed when clicked
    translateButton.addEventListener('mousedown', function(e) {
        e.stopPropagation();
    });
    
    translateButton.addEventListener('click', function(e) {
        e.stopPropagation();
        performSelectionTranslation(selectedText);
        translateButton.remove();
    });
    
    document.body.appendChild(translateButton);
    
    // Add a global click listener to remove the button when clicking elsewhere
    // Use setTimeout to avoid immediate triggering
    setTimeout(() => {
        const clickOutsideHandler = function(e) {
            if (e.target.id !== 'translate-selected-text') {
                let button = document.getElementById('translate-selected-text');
                if (button) {
                    button.remove();
                }
                document.removeEventListener('click', clickOutsideHandler);
            }
        };
        document.addEventListener('click', clickOutsideHandler);
    }, 100);
}

// Function to perform translation of selected text
async function performSelectionTranslation(selectedText) {
    if (selectedText) {
        let translation = await translateText(selectedText);
        if (translation) {
            displayTranslation(translation);
        } else {
            alert('Translation failed.');
        }
    }
}

// Function to display translation in a new box with preserved formatting
function displayTranslation(translation) {
    let translationBox = document.getElementById('translation-box');
    if (!translationBox) {
        translationBox = document.createElement('div');
        translationBox.id = 'translation-box';
        translationBox.style.position = 'fixed';
        translationBox.style.top = '50%';
        translationBox.style.left = '50%';
        translationBox.style.transform = 'translate(-50%, -50%)';
        translationBox.style.borderRadius = '8px';
        translationBox.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';
        translationBox.style.padding = '20px';
        translationBox.style.maxWidth = '80%';
        translationBox.style.maxHeight = '80vh';
        translationBox.style.overflowY = 'auto';
        translationBox.style.zIndex = '1000';
        translationBox.style.opacity = '0';
        translationBox.style.transition = 'opacity 0.3s ease-in-out';

        // Dark mode detection and styling
        const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        translationBox.style.backgroundColor = isDarkMode ? '#333' : '#fff';
        translationBox.style.color = isDarkMode ? '#fff' : '#333';

        // Modern close button
        const closeButton = document.createElement('button');
        closeButton.textContent = '×';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '10px';
        closeButton.style.right = '10px';
        closeButton.style.background = 'transparent';
        closeButton.style.border = 'none';
        closeButton.style.fontSize = '24px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.color = isDarkMode ? '#fff' : '#333';
        closeButton.addEventListener('click', function() {
            translationBox.style.opacity = '0';
            setTimeout(() => {
                if (translationBox && translationBox.parentNode) {
                    translationBox.parentNode.removeChild(translationBox);
                    // Remove the translate button if it exists
                    let translateButton = document.getElementById('translate-selected-text');
                    if (translateButton) {
                        translateButton.remove();
                    }
                    // Deselect the text after closing the translation window
                    window.getSelection().removeAllRanges();
                }
            }, 300);
        });
        translationBox.appendChild(closeButton);

        // Create <pre> tag for translation content with formatting preservation
        const translationText = document.createElement('pre');
        translationText.innerHTML = translation;
        translationText.style.whiteSpace = 'pre-wrap';
        translationText.style.fontFamily = 'inherit';
        translationText.style.fontSize = '16px';
        translationText.style.lineHeight = '1.5';
        translationText.style.marginTop = '40px';

        // Detect text direction based on presence of RTL characters
        const isRTL = /[\u0600-\u06FF]/.test(translation);
        translationText.style.direction = isRTL ? 'rtl' : 'ltr';
        translationText.style.textAlign = isRTL ? 'right' : 'left';

        translationBox.appendChild(translationText);
        document.body.appendChild(translationBox);

        // Execute fade-in effect
        requestAnimationFrame(() => {
            translationBox.style.opacity = '1';
        });

        // Close translation box when clicking outside of it
        const clickOutsideHandler = function(e) {
            if (!translationBox.contains(e.target)) {
                translationBox.style.opacity = '0';
                setTimeout(() => {
                    if (translationBox && translationBox.parentNode) {
                        translationBox.parentNode.removeChild(translationBox);
                        // Remove the translate button if it exists
                        let translateButton = document.getElementById('translate-selected-text');
                        if (translateButton) {
                            translateButton.remove();
                        }
                        // Deselect the text after closing the translation window
                        window.getSelection().removeAllRanges();
                    }
                }, 300);
                document.removeEventListener('click', clickOutsideHandler);
            }
        };
        setTimeout(() => {
            document.addEventListener('click', clickOutsideHandler);
        }, 100);
    } else {
        const translationText = translationBox.querySelector('pre');
        translationText.innerHTML = translation;
        // Update text direction if content changes
        const isRTL = /[\u0600-\u06FF]/.test(translation);
        translationText.style.direction = isRTL ? 'rtl' : 'ltr';
        translationText.style.textAlign = isRTL ? 'right' : 'left';
    }
}

// Translation function using the Gemini API with caching
const translationCache = new Map();

async function translateText(text) {
    if (translationCache.has(text)) {
        return translationCache.get(text);
    }

    // Get API key and prompt from storage
    const { apiKey, translationPrompt } = await chrome.storage.sync.get(['apiKey', 'translationPrompt']);

    if (!apiKey) {
        console.error('API key not found. Please set it in the extension settings.');
        return null;
    }
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const prompt = (translationPrompt || '').replace('<TEXT>', text);

    const payload = {
        contents: [{
            parts: [{ text: prompt }]
        }]
    };
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.status === 429) {
            // Rate limit hit - wait and retry
            await new Promise(resolve => setTimeout(resolve, 2000));
            return translateText(text);
        }

        if (!response.ok) {
            throw new Error(`Translation failed: ${response.status}`);
        }

        const result = await response.json();
        const translatedText = result.candidates?.[0]?.content?.parts?.[0]?.text || null;
        if (translatedText) {
            translationCache.set(text, translatedText);
        }
        return translatedText;
    } catch (error) {
        console.warn('Translation error:', error.message);
        return null;
    }
}

/* ========================================
   Tweet Translation (for Twitter)
   ======================================== */
async function performTranslation(tweet, textContent, lang, button) {
  // Show a loading state
  button.textContent = 'در حال ترجمه...';
  button.disabled = true;

  // Prepare text
  const cleanedText = textContent.replace(/\s+/g, ' ').trim();

  // Fetch translation
  let translation = await translateText(cleanedText, lang);
  if (!translation) {
    console.log('Retrying translation...');
    translation = await translateText(cleanedText, lang);
  }

  if (translation) {
    // Remove the original button
    button.remove();

    // Create a wrapper that will hold both the header (floating above the content) and the translation content
    const translationWrapper = document.createElement('div');
    Object.assign(translationWrapper.style, {
      position: 'relative',
      marginTop: '10px',
      border: '2px solid #69b611',  // Dark green border around entire box
      borderRadius: '8px',
      backgroundColor: '#daffa3',   // Light green background
      color: '#145b01',             // Dark green text
      fontFamily: 'Tahoma, sans-serif',
      fontSize: '16px',
      lineHeight: '1.5',
      width: '100%',
      boxSizing: 'border-box',
      paddingTop: '24px'            // Extra space at the top for the header
    });

    // Create header that appears above the content in the top-right corner
    const headerLabel = document.createElement('div');
    Object.assign(headerLabel.style, {
      position: 'absolute',
      top: '0',
      right: '10px',
      backgroundColor: '#daffa3',  // Same as container
      padding: '0 8px',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center'
    });
    const labelText = document.createElement('span');
    labelText.textContent = 'ترجمه';
    const refreshIcon = document.createElement('span');
    refreshIcon.innerHTML = '&#x21bb;';
    Object.assign(refreshIcon.style, {
      cursor: 'pointer',
      fontSize: '18px',
      marginLeft: '8px'
    });
    headerLabel.appendChild(labelText);
    headerLabel.appendChild(refreshIcon);

    // Create content area for the translated text
    const contentBox = document.createElement('div');
    Object.assign(contentBox.style, {
      padding: '12px',
      direction: 'rtl',
      textAlign: 'right'
    });
    const translatedDiv = document.createElement('div');
    translatedDiv.className = 'translated-text';
    translatedDiv.textContent = translation;
    Object.assign(translatedDiv.style, {
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      margin: '0'
    });
    contentBox.appendChild(translatedDiv);

    // Assemble the wrapper: header on top, then content below
    translationWrapper.appendChild(headerLabel);
    translationWrapper.appendChild(contentBox);

    // Insert the translation wrapper after the tweet
    tweet.insertAdjacentElement('afterend', translationWrapper);

    // Add refresh functionality to the icon
    refreshIcon.addEventListener('click', async (event) => {
      event.stopPropagation();
      translatedDiv.textContent = '...در حال ترجمه مجدد';
      translationCache.delete(cleanedText);
      const newTranslation = await translateText(cleanedText, lang);
      translatedDiv.textContent = newTranslation
        ? newTranslation
        : 'خطا در بازترجمه. لطفاً دوباره تلاش کنید.';
    });
  } else {
    alert('خطا در ترجمه.');
    button.textContent = 'ترجمه توییت';
    button.disabled = false;
  }
}

// Determine if the current site is Twitter (or X)
function isTwitterSite() {
  return window.location.hostname === 'twitter.com' || window.location.hostname === 'x.com';
}

// Add translation buttons to tweets on Twitter
async function addTranslateButtons() {
  if (!isTwitterSite()) return;

  // Select tweets that are not in Persian
  const tweets = document.querySelectorAll('article div[dir="auto"]:not([lang="fa"])');
  for (const tweet of tweets) {
    if (tweet.dataset.buttonAdded) continue;
    tweet.dataset.buttonAdded = true;
    tweet.style.position = 'relative';
    const button = document.createElement('button');
    button.textContent = 'ترجمه';
    Object.assign(button.style, {
      position: 'absolute',
      top: '5px',
      right: '5px',
      padding: '2px 4px',
      fontSize: '10px',
      backgroundColor: '#749e00',
      color: 'white',
      border: 'none',
      borderRadius: '3px',
      cursor: 'pointer',
      display: 'none'
    });
    tweet.addEventListener('mouseenter', () => {
      button.style.display = 'block';
    });
    tweet.addEventListener('mouseleave', () => {
      button.style.display = 'none';
    });
    button.addEventListener('click', async (event) => {
      event.stopPropagation();
      const textContent = tweet.textContent.trim();
      const lang = tweet.getAttribute('lang');
      await performTranslation(tweet, textContent, lang, button);
    });
    tweet.appendChild(button);
  }
}

// Use MutationObserver to catch dynamically loaded tweets and add buttons
if (isTwitterSite()) {
  const observer = new MutationObserver(debounce(() => addTranslateButtons(), 250));
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Debounce helper function to limit the rate of function calls
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
