<template>
  <div class="image-widget">
    <div class="image-container">
      <img 
        src="/pie-chart.png" 
        alt="Program Blocks Pie Chart"
        class="pie-chart-image"
      />
    </div>
    
    <div class="widget-footer">
      <div class="footer-content">
        <h3 class="widget-title">Program area distribution by block type</h3>
        <span class="timestamp">{{ description }}</span>
      </div>
      <a href="/pie-chart.png" download="program-blocks-pie-chart.png" class="download-btn">
        📥 Download
      </a>
    </div>
  </div>
</template>

<script setup>
defineProps({
  imageUrl: {
    type: String,
    required: false
  },
  title: {
    type: String,
    default: 'Program Pie Chart'
  },
  description: {
    type: String,
    default: 'Generated: 14/03/2026, 11:35:19'
  }
})
</script>

<style scoped>
.image-widget {
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  height: 100%;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.image-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: white;
  overflow: hidden;
}

.pie-chart-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 4px;
}

.widget-footer {
  padding: 16px 20px;
  border-top: 1px solid #e2e8f0;
  background: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  gap: 16px;
}

.footer-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.widget-title {
  margin: 0;
  font-size: 16px;
  color: #1f2937;
  font-weight: 600;
}

.timestamp {
  font-size: 12px;
  color: #64748b;
}

.download-btn {
  padding: 8px 16px;
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.download-btn:hover {
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.3);
  transform: translateY(-1px);
}
</style>
