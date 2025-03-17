document.addEventListener('DOMContentLoaded', () => {
    // Cache DOM elements
    const apiKeyInput = document.getElementById('api-key');
    const promptInput = document.getElementById('translation-prompt');
    const saveButton = document.getElementById('save-settings');
    const statusEl = document.getElementById('status');

    // Ensure all required elements exist
    if (!apiKeyInput || !promptInput || !saveButton || !statusEl) {
        console.error('One or more required elements are missing.');
        return;
    }

    // Load saved settings
    chrome.storage.sync.get(['apiKey', 'translationPrompt'], (result) => {
        const savedApiKey = result.apiKey || '';
        const defaultPrompt = `You are a professional news translator. Carefully analyze the entire text to understand its subject matter, context, and key message before translating.

Translate the following text into Persian while preserving the original formatting exactly, including line breaks, lists, spacing, bullet points, bold text, italics, and indentation.

- Maintain the original tone of the text (formal, informal, neutral, persuasive, etc.).  
- If the text is formal, use a professional and polished tone.  
- If the text is conversational, keep it natural and engaging.  
- If the text is technical (e.g., medical, legal, engineering), use precise terminology.  
- If the text contains idioms or metaphors, translate them naturally rather than literally.  

Ensure that words and phrases are translated with the correct meaning based on context, not just literally. Adapt terminology appropriately based on the subject of the text to maintain accuracy and readability.

Original Text:
<TEXT>

Translated Text (with the same formatting and tone):`;


        const savedPrompt = result.translationPrompt || defaultPrompt;

        // Set saved values
        apiKeyInput.value = savedApiKey;
        promptInput.value = savedPrompt;
    });

    // Save settings when the save button is clicked
    saveButton.addEventListener('click', () => {
        const apiKey = apiKeyInput.value.trim();
        const translationPrompt = promptInput.value.trim();

        chrome.storage.sync.set({ apiKey, translationPrompt }, () => {
            // Provide clear user feedback
            statusEl.textContent = 'Settings saved!';
            statusEl.style.display = 'block';
            setTimeout(() => {
                statusEl.style.display = 'none';
            }, 2000);
        });
    });
});

