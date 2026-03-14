<template>
  <div class="speckle-viewer-widget">
    <div class="widget-header">
      <div>
        <h3>🏗️ 3D Model Viewer</h3>
        <p class="description">Speckle model visualization</p>
      </div>
    </div>

    <div ref="viewerContainer" class="viewer-container">
      <div v-if="loading" class="loading-state">
        <div class="spinner">⟳</div>
        <p>Loading 3D model...</p>
      </div>
      
      <div v-if="error" class="error-state">
        <div class="error-icon">⚠️</div>
        <p class="error-message">{{ error }}</p>
        <a 
          :href="`https://app.speckle.systems/streams/${projectId}`"
          target="_blank"
          class="fallback-link"
        >
          View in Speckle →
        </a>
      </div>
    </div>

    <div class="viewer-footer">
      <div class="model-info">
        <span class="info-label">Project:</span>
        <span class="info-value">{{ projectId?.substring(0, 8) }}...</span>
        <span class="info-label">Model:</span>
        <span class="info-value">{{ modelId?.substring(0, 8) }}...</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Viewer } from '@speckle/viewer'

const props = defineProps({
  projectId: {
    type: String,
    required: true
  },
  modelId: {
    type: String,
    required: true
  }
})

const viewerContainer = ref(null)
const loading = ref(true)
const error = ref(null)
let viewer = null

async function initializeViewer() {
  // Wait for Vue to fully render the DOM
  await new Promise(resolve => setTimeout(resolve, 200))
  
  if (!viewerContainer.value) {
    console.error('❌ Viewer container ref not found')
    error.value = 'Viewer container not ready'
    loading.value = false
    return
  }

  try {
    console.log('🎨 Initializing Speckle Viewer...')
    console.log('   Container element:', viewerContainer.value)
    
    // Create viewer instance - pass the actual DOM element
    viewer = new Viewer({
      container: viewerContainer.value,
      showStats: false,
      verbose: true
    })

    await viewer.init()
    console.log('✅ Viewer initialized')

    // Load the Speckle object
    const objectUrl = `https://app.speckle.systems/streams/${props.projectId}/objects/${props.modelId}`
    
    console.log('📦 Loading object:', objectUrl)
    
    const token = import.meta.env.VITE_SPECKLE_TOKEN
    
    await viewer.loadObject(objectUrl, token)
    
    console.log('✅ Object loaded successfully')
    
    // Zoom to fit the model
    viewer.zoom()
    
    loading.value = false
    
  } catch (err) {
    console.error('❌ Failed to initialize viewer:', err)
    error.value = `Failed to load 3D model: ${err.message}`
    loading.value = false
  }
}

onMounted(async () => {
  console.log('✅ SpeckleViewer: Component mounted')
  console.log('   Project:', props.projectId)
  console.log('   Model:', props.modelId)
  
  await initializeViewer()
})

onUnmounted(() => {
  if (viewer) {
    console.log('🧹 Cleaning up viewer')
    viewer.dispose()
    viewer = null
  }
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
}

.widget-header {
  padding: 16px 20px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
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

.viewer-container {
  flex: 1;
  position: relative;
  min-height: 0;
  background: #1a1a1a;
  overflow: hidden;
}

.loading-state,
.error-state {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  color: white;
  gap: 16px;
  z-index: 10;
}

.spinner {
  font-size: 48px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.error-icon {
  font-size: 64px;
  opacity: 0.5;
}

.error-message {
  color: #ef4444;
  font-weight: 500;
  font-size: 14px;
  max-width: 300px;
  text-align: center;
}

.fallback-link {
  color: #3b82f6;
  text-decoration: none;
  padding: 10px 20px;
  border: 1px solid #3b82f6;
  border-radius: 6px;
  margin-top: 12px;
  transition: all 0.2s;
}

.fallback-link:hover {
  background: #3b82f6;
  color: white;
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
}
</style>
