<template>
  <div class="speckle-viewer-widget">
    <div class="widget-header">
      <div>
        <h3>🏗️ 3D Model Viewer</h3>
        <p class="description">Interactive Speckle model visualization</p>
      </div>
      <div class="viewer-controls">
        <button @click="resetView" class="control-btn" title="Reset view">
          🎯 Reset
        </button>
        <button @click="toggleWireframe" class="control-btn" title="Toggle wireframe">
          ☐ Wireframe
        </button>
      </div>
    </div>

    <div class="viewer-container-wrapper">
      <iframe 
        v-if="iframeUrl && !error"
        :src="iframeUrl"
        class="speckle-iframe"
        allow="camera *; fullscreen"
      ></iframe>
      
      <div v-if="loading" class="loading-overlay">
        <div class="spinner-large">⟳</div>
        <p>Loading 3D model...</p>
      </div>
      
      <div v-if="error" class="error-overlay">
        <div class="error-icon">❌</div>
        <p>{{ error }}</p>
        <button @click="retryLoad" class="retry-btn">Retry</button>
      </div>
    </div>

    <div class="viewer-footer">
      <div class="model-info">
        <span class="info-label">Project:</span>
        <span class="info-value" title="Full project ID">{{ projectId }}</span>
        <span class="info-label">Model:</span>
        <span class="info-value" title="Full model ID">{{ modelId }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  projectId: {
    type: String,
    required: true
  },
  modelId: {
    type: String,
    required: true
  },
  token: {
    type: String,
    required: true
  }
})

const loading = ref(true)
const error = ref(null)

const iframeUrl = computed(() => {
  if (!props.projectId || !props.modelId) {
    return null
  }
  // Use Speckle's embed URL
  return `https://app.speckle.systems/embed?stream=${props.projectId}&object=${props.modelId}`
})

function resetView() {
  // Iframe controls are limited - user can use viewer's built-in reset button
  console.log('Reset view requested')
}

function toggleWireframe() {
  console.log('Wireframe toggle requested')
}

function retryLoad() {
  error.value = null
  loading.value = true
}

onMounted(() => {
  // Simulate loading - iframe load is handled by the iframe itself
  setTimeout(() => {
    loading.value = false
  }, 500)
})
</script>

<style scoped>
.speckle-viewer-widget {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  overflow: hidden;
  border: 1.5px solid #d1d5db;
}

.widget-header {
  padding: 16px 20px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.widget-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.description {
  margin: 4px 0 0 0;
  font-size: 13px;
  color: #6b7280;
}

.viewer-controls {
  display: flex;
  gap: 8px;
}

.control-btn {
  padding: 6px 12px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.control-btn:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.viewer-container-wrapper {
  flex: 1;
  position: relative;
  min-height: 300px;
  background: #f8f9fa;
  overflow: hidden;
}

.speckle-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.loading-overlay,
.error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.95);
  z-index: 10;
}

.spinner-large {
  font-size: 48px;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-overlay p {
  margin: 0 0 16px 0;
  color: #666;
}

.retry-btn {
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.retry-btn:hover {
  background: #0056b3;
}

.viewer-footer {
  padding: 12px 20px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.model-info {
  display: flex;
  gap: 16px;
  font-size: 11px;
  color: #6b7280;
  flex-wrap: wrap;
}

.info-label {
  font-weight: 500;
  color: #374151;
}

.info-value {
  font-family: monospace;
  background: white;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>