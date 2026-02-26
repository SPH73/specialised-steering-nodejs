(function() {
  'use strict';

  const API_BASE = window.ADMIN_API_BASE || '/admin/google/photos';
  const GOOGLE_CLIENT_ID = window.GOOGLE_CLIENT_ID;

  let currentSessionId = null;

  /**
   * Update status display
   */
  function updateStatus(message, type = 'info') {
    const statusDiv = document.getElementById('galleryStatus');
    const statusMessage = document.getElementById('statusMessage');

    if (!statusDiv || !statusMessage) return;

    statusDiv.style.display = 'block';
    statusMessage.innerHTML = message; // Changed to innerHTML to support countdown
    statusDiv.className = `gallery-status status-${type}`;
  }


  /**
   * Show/hide progress indicator
   */
  function showProgress(show) {
    const progressDiv = document.getElementById('statusProgress');
    if (progressDiv) {
      progressDiv.style.display = show ? 'block' : 'none';
    }
  }

  /**
   * Update gallery item count
   */
  async function updateItemCount() {
    // Note: This would require a GET /admin/gallery/count endpoint
    // For Phase 4, we can skip this or add a simple endpoint
    // For now, we'll leave it as placeholder
    const countSpan = document.getElementById('itemCount');
    if (countSpan) {
      countSpan.textContent = 'Loading...';
    }
  }

  /**
   * Create picker session via backend API and get picker URI
   */
  async function createSession() {
    try {
      const response = await fetch(`${API_BASE}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create session');
      }

      const data = await response.json();
      return data.sessionId;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  /**
   * Get session status (includes pickerUri)
   */
  async function getSessionStatus(sessionId) {
    try {
      const response = await fetch(`${API_BASE}/sessions/${sessionId}/status`);

      if (!response.ok) {
        throw new Error('Failed to get session status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting session status:', error);
      throw error;
    }
  }

  /**
   * Open Google Photos Picker UI by redirecting to pickerUri
   */
  function openPicker(pickerUri) {
    // Open picker in a new window/tab
    const pickerWindow = window.open(pickerUri, 'Google Photos Picker', 'width=800,height=600');

    if (!pickerWindow) {
      throw new Error('Popup blocked. Please allow popups for this site.');
    }

    // Return a promise that resolves when the window is closed
    // (we'll poll for status instead of waiting for window close)
    return new Promise((resolve, reject) => {
      // Check if window was closed manually
      const checkClosed = setInterval(() => {
        if (pickerWindow.closed) {
          clearInterval(checkClosed);
          // User may have closed without selecting, but we'll poll to see if items were selected
          resolve();
        }
      }, 500);

      // Note: We don't reject on close because the user might have selected items
      // before closing. We'll poll the status instead.
    });
  }

  /**
   * Poll session status
   * Polls the session status until mediaItemsSet is true or maxAttempts reached
   */
  async function pollSessionStatus(sessionId, maxAttempts = 60) {
    const pollInterval = 1000; // Poll every 1 second

    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await fetch(`${API_BASE}/sessions/${sessionId}/status`);

        if (!response.ok) {
          // Check for session expiration errors (404 or 400)
          if (response.status === 404 || response.status === 400) {
            const errorData = await response.json().catch(() => ({}));
            if (errorData.message && errorData.message.includes('session')) {
              throw new Error('SESSION_EXPIRED');
            }
          }
          throw new Error('Failed to get session status');
        }

        const status = await response.json();

        if (status.mediaItemsSet) {
          return status;
        }

        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      } catch (error) {
        if (error.message === 'SESSION_EXPIRED') {
          throw error;
        }
        if (i === maxAttempts - 1) {
          // Last attempt failed
          throw new Error('Session status polling timeout - maximum polling attempts reached');
        }
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      }
    }

    throw new Error('Session status polling timeout - maximum polling attempts reached');
  }

  /**
   * Ingest media items from session
   */
  async function ingestMedia(sessionId, replaceMode) {
    try {
      updateStatus('Uploading and processing photos...', 'info');
      showProgress(true);

      const response = await fetch(`${API_BASE}/sessions/${sessionId}/ingest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ replaceMode: replaceMode })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to ingest media');
      }

      const result = await response.json();

      if (result.errors && result.errors.length > 0) {
        updateStatus(
          `Completed with ${result.errors.length} error(s). Ingested: ${result.ingested}, Skipped: ${result.skipped}`,
          'warning'
        );
      } else {
        updateStatus(
          `Success! Ingested: ${result.ingested}, Skipped: ${result.skipped}`,
          'success'
        );
      }

      // Update item count
      await updateItemCount();

      return result;
    } catch (error) {
      console.error('Error ingesting media:', error);
      updateStatus(`Error: ${error.message}`, 'error');
      throw error;
    } finally {
      showProgress(false);
    }
  }

  /**
   * Main workflow: Create session, open picker, poll status, ingest
   */
  async function updateGallery() {
    const replaceModeCheckbox = document.getElementById('replaceMode');
    const replaceMode = replaceModeCheckbox ? replaceModeCheckbox.checked : false;
    const updateBtn = document.getElementById('updateGalleryBtn');

    try {
      // Disable button during operation
      if (updateBtn) updateBtn.disabled = true;

      updateStatus('Creating session...', 'info');

      // Create session
      const sessionId = await createSession();
      currentSessionId = sessionId;

      // Get session status to retrieve pickerUri
      updateStatus('Getting picker URL...', 'info');
      const sessionStatus = await getSessionStatus(sessionId);

      if (!sessionStatus.pickerUri) {
        throw new Error('Picker URI not available in session');
      }

      updateStatus('Opening photo picker...', 'info');

      // Open picker (redirects to pickerUri)
      await openPicker(sessionStatus.pickerUri);

      updateStatus('Waiting for photo selection... Please select photos and click "Done" when finished.', 'info');

      // Poll for session completion
      await pollSessionStatus(sessionId);

      updateStatus('Photos selected. Processing...', 'info');

      // Ingest media
      await ingestMedia(sessionId, replaceMode);

    } catch (error) {
      console.error('Error updating gallery:', error);

      // Provide user-friendly error messages for common issues
      let errorMessage = error.message;
      if (error.message === 'SESSION_EXPIRED') {
        errorMessage = '❌ The session has expired. Please try again by clicking the "Update Gallery" button.';
      } else if (error.message.includes('timeout')) {
        errorMessage = '⏱️ The request timed out while waiting for photo selection. Please try again.';
      } else if (error.message.includes('Failed to get session status')) {
        errorMessage = '❌ Unable to check session status. The session may have expired. Please try again.';
      }

      updateStatus(`Error: ${errorMessage}`, 'error');
    } finally {
      if (updateBtn) updateBtn.disabled = false;
    }
  }

  /**
   * Initialize on page load
   */
  function init() {
    const updateBtn = document.getElementById('updateGalleryBtn');
    if (updateBtn) {
      updateBtn.addEventListener('click', updateGallery);
    }

    // Load initial item count
    updateItemCount();
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

