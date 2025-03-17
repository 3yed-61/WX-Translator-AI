// When the extension is installed, log a message indicating readiness.
chrome.runtime.onInstalled.addListener(() => {
    console.log('اکستنشن نصب شد و آماده به کار است.');
});

// Listen for messages from other parts of the extension.
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.action === 'getLanguages') {
        try {
            // Retrieve 'selectedLanguages' from Chrome storage.
            const data = await chrome.storage.sync.get(['selectedLanguages']);
            let languages = data.selectedLanguages;
            // Ensure the value is an array and non-empty; otherwise, default to ['auto'].
            if (!Array.isArray(languages) || languages.length === 0) {
                languages = ['auto'];
            }
            sendResponse({ languages });
        } catch (error) {
            console.error('Error retrieving selectedLanguages:', error);
            sendResponse({ languages: ['auto'] });
        }
        // Return true to indicate an asynchronous response.
        return true;
    }
});

