<template>
  <div class="image-widget">
    <div class="widget-header">
      <h3>{{ title }}</h3>
      <p v-if="description" class="description">{{ description }}</p>
    </div>
    
    <div class="image-container">
      <img 
        src="/pie-chart.png" 
        alt="Program Blocks Pie Chart"
        class="pie-chart-image"
      />
    </div>
    
    <div class="widget-footer">
      <span class="footer-text">Program area distribution by block type</span>
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
    default: 'visualization-excel'
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
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.widget-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
  flex-shrink: 0;
}

.widget-header h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #1f2937;
  font-weight: 600;
}

.description {
  margin: 0;
  font-size: 13px;
  color: #64748b;
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
  padding: 16px 24px;
  border-top: 1px solid #e2e8f0;
  background: white;
  display: flex;
  justify-content: center;
  flex-shrink: 0;
}

.footer-text {
  font-size: 12px;
  color: #64748b;
}
</style>
