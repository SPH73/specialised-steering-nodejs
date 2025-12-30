(function() {
  'use strict';

  const API_BASE = window.ADMIN_API_BASE || '/admin/google/photos';
  const GOOGLE_CLIENT_ID = window.GOOGLE_CLIENT_ID;
  
  let pickerApiLoaded = false;
  let currentSessionId = null;

  /**
   * Update status display
   */
  function updateStatus(message, type = 'info') {
    const statusDiv = document.getElementById('galleryStatus');
    const statusMessage = document.getElementById('statusMessage');
    
    if (!statusDiv || !statusMessage) return;
    
    statusDiv.style.display = 'block';
    statusMessage.textContent = message;
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
   * Initialize Google Picker API
   */
  function initializePicker() {
    return new Promise((resolve, reject) => {
      if (pickerApiLoaded) {
        resolve();
        return;
      }

      if (!GOOGLE_CLIENT_ID) {
        reject(new Error('GOOGLE_CLIENT_ID not configured'));
        return;
      }

      gapi.load('picker', {
        callback: () => {
          pickerApiLoaded = true;
          resolve();
        },
        onerror: () => {
          reject(new Error('Failed to load Google Picker API'));
        }
      });
    });
  }

  /**
   * Create picker session via backend API
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
   * Open Google Photos Picker UI
   */
  function openPicker(sessionId) {
    return new Promise((resolve, reject) => {
      const picker = new google.picker.PhotoPickerBuilder()
        .setDeveloperKey(GOOGLE_CLIENT_ID)
        .setSessionId(sessionId)
        .setOAuthToken('') // Not needed for Photo Picker
        .setCallback((data) => {
          if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
            resolve(sessionId);
          } else if (data[google.picker.Response.ACTION] === google.picker.Action.CANCEL) {
            reject(new Error('Picker cancelled'));
          } else {
            reject(new Error('Picker error'));
          }
        })
        .build();
      
      picker.setVisible(true);
    });
  }

  /**
   * Poll session status
   */
  async function pollSessionStatus(sessionId, maxAttempts = 30) {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await fetch(`${API_BASE}/sessions/${sessionId}/status`);
        
        if (!response.ok) {
          throw new Error('Failed to get session status');
        }

        const status = await response.json();
        
        if (status.mediaItemsSet) {
          return status;
        }
        
        // Wait before next poll (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      } catch (error) {
        if (i === maxAttempts - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    throw new Error('Session status polling timeout');
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

      updateStatus('Initializing...', 'info');

      // Initialize Picker API
      await initializePicker();

      updateStatus('Creating session...', 'info');

      // Create session
      const sessionId = await createSession();
      currentSessionId = sessionId;

      updateStatus('Opening photo picker...', 'info');

      // Open picker
      await openPicker(sessionId);

      updateStatus('Waiting for photo selection...', 'info');

      // Poll for session completion
      await pollSessionStatus(sessionId);

      updateStatus('Photos selected. Processing...', 'info');

      // Ingest media
      await ingestMedia(sessionId, replaceMode);

    } catch (error) {
      console.error('Error updating gallery:', error);
      updateStatus(`Error: ${error.message}`, 'error');
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

