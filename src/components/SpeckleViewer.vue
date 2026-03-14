<template>
  <div class="speckle-viewer-widget">
    <div class="widget-header">
      <div>
        <h3>🏗️ 3D Model Viewer</h3>
        <p class="description">Speckle model visualization</p>
      </div>
    </div>

    <div class="viewer-container-wrapper">
      <div class="model-display">
        <div class="model-icon">🏢</div>
        
        <h4>Model Ready</h4>
        <p class="model-text">Your Speckle 3D model is loaded and ready to view.</p>
        
        <a 
          :href="`https://app.speckle.systems/streams/${projectId}`"
          target="_blank"
          rel="noopener noreferrer"
          class="view-btn"
        >
          ↗ View Model in Speckle
        </a>

        <div class="model-info-box">
          <div class="info-row">
            <span class="label">Stream:</span>
            <code class="value">{{ projectId }}</code>
          </div>
          <div class="info-row">
            <span class="label">Model:</span>
            <code class="value">{{ modelId }}</code>
          </div>
        </div>
      </div>
    </div>

    <div class="viewer-footer">
      <div class="model-info">
        <span class="info-label">Project:</span>
        <span class="info-value">{{ projectId }}</span>
        <span class="info-label">Model:</span>
        <span class="info-value">{{ modelId }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  projectId: {
    type: String,
    required: true
  },
  modelId: {
    type: String,
    required: true
  }
})

console.log('✅ SpeckleViewer: Component ready')
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

.viewer-container-wrapper {
  flex: 1;
  position: relative;
  min-height: 0;
  background: linear-gradient(135deg, #f8f9fa 0%, #f0f1f3 100%);
  overflow: hidden;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.model-display {
  text-align: center;
  padding: 32px 24px;
  max-width: 100%;
}

.model-icon {
  font-size: 56px;
  margin-bottom: 16px;
}

.model-display h4 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.model-text {
  margin: 0 0 24px 0;
  font-size: 14px;
  color: #6b7280;
}

.view-btn {
  display: inline-block;
  padding: 12px 28px;
  background: #3b82f6;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
  margin-bottom: 20px;
}

.view-btn:hover {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.model-info-box {
  margin-top: 24px;
  padding: 16px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  justify-content: center;
  gap: 12px;
  align-items: center;
  font-size: 13px;
}

.label {
  font-weight: 500;
  color: #374151;
  min-width: 60px;
}

.value {
  font-family: 'Monaco', 'Courier New', monospace;
  background: #f3f4f6;
  padding: 4px 8px;
  border-radius: 4px;
  color: #6b7280;
  font-size: 12px;
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
</style>