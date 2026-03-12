<template>
  <div class="image-widget">
    <div class="widget-header">
      <div>
        <h3>{{ title }}</h3>
        <p v-if="description" class="description">{{ description }}</p>
      </div>
      <button @click="downloadImage" class="download-btn" title="Download image">
        💾 Download
      </button>
    </div>
    
    <div class="image-container" :class="{ loading: imageLoading, error: imageError }">
      <img 
        v-if="!imageError"
        :src="imageUrl" 
        :alt="title"
        @load="onImageLoad"
        @error="onImageError"
      />
      <div v-if="imageLoading" class="overlay loading-overlay">
        <div class="spinner">⟳</div>
        <p>Loading image...</p>
      </div>
      <div v-if="imageError" class="overlay error-overlay">
        <div class="error-icon">❌</div>
        <p>Failed to load image</p>
        <a :href="imageUrl" target="_blank" class="fallback-link">
          Open in new tab →
        </a>
      </div>
    </div>

    <div class="image-footer">
      <span class="info-label">Source:</span>
      <a :href="imageUrl" target="_blank" class="image-link" title="Open full size">
        View full size →
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  imageUrl: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: 'Image'
  },
  description: {
    type: String,
    default: ''
  }
})

const imageLoading = ref(true)
const imageError = ref(false)

function onImageLoad() {
  imageLoading.value = false
  imageError.value = false
  console.log('✅ Image loaded successfully:', props.imageUrl)
}

function onImageError(event) {
  imageLoading.value = false
  imageError.value = true
  console.error('❌ Failed to load image:', props.imageUrl)
  console.error('   Error details:', event)
}

function downloadImage() {
  try {
    const link = document.createElement('a')
    link.href = props.imageUrl
    link.download = `${props.title.replace(/\s+/g, '_')}.png`
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    console.log('📥 Download initiated')
  } catch (err) {
    console.error('❌ Download failed:', err)
    window.open(props.imageUrl, '_blank')
  }
}
</script>

<style scoped>
.image-widget {
  background: white;
  padding: 28px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  transition: box-shadow 0.3s;
  border: 1.5px solid #d1d5db;
}

.image-widget:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  gap: 16px;
}

.widget-header h3 {
  margin: 0;
  color: #1e293b;
  font-size: 18px;
  font-weight: 700;
}

.description {
  margin: 6px 0 0 0;
  color: #64748b;
  font-size: 13px;
}

.download-btn {
  padding: 8px 16px;
  background: #f1f5f9;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.download-btn:hover {
  background: #e2e8f0;
  border-color: #9ca3af;
}

.image-container {
  position: relative;
  background: #f8fafc;
  border-radius: 8px;
  overflow: hidden;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-container img {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 8px;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: rgba(248, 250, 252, 0.98);
}

.loading-overlay {
  color: #64748b;
}

.error-overlay {
  color: #dc2626;
}

.spinner {
  font-size: 32px;
  animation: spin 1.5s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.error-icon {
  font-size: 48px;
}

.overlay p {
  font-size: 14px;
  font-weight: 600;
}

.fallback-link {
  color: #3b82f6;
  text-decoration: none;
  font-size: 13px;
  margin-top: 8px;
}

.fallback-link:hover {
  text-decoration: underline;
}

.image-footer {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
}

.info-label {
  color: #64748b;
  font-weight: 600;
}

.image-link {
  color: #3b82f6;
  text-decoration: none;
  transition: color 0.3s;
}

.image-link:hover {
  color: #2563eb;
  text-decoration: underline;
}
</style>
