<template>
  <div class="validation-widget">
    <!-- Excel Table Preview -->
    <div v-if="excelData.length > 0" class="excel-section">
      <div class="excel-tabs" v-if="excelData.length > 1">
        <button 
          v-for="(sheet, idx) in excelData" 
          :key="idx"
          @click="activeSheet = idx"
          :class="{ active: activeSheet === idx }"
          class="tab-button"
        >
          {{ sheet.name }}
        </button>
      </div>
      
      <div class="excel-table-container">
        <table class="excel-table" v-if="excelData[activeSheet]">
          <thead>
            <tr>
              <th v-for="(header, idx) in excelData[activeSheet].headers" :key="idx">
                {{ header }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, ridx) in excelData[activeSheet].rows" :key="ridx">
              <td v-for="(cell, cidx) in row" :key="cidx">
                {{ cell }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Footer with Title, Timestamp, and Download Button -->
    <div class="widget-footer" v-if="data.blobUrls && data.blobUrls.length > 0">
      <div class="footer-content">
        <h3 class="widget-title">{{ title }}</h3>
        <span class="timestamp">{{ formatDate(data.createdAt) }}</span>
      </div>
      <a 
        v-if="data.blobUrls[0]"
        :href="data.blobUrls[0].url" 
        download
        class="download-btn"
      >
        Download
      </a>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner">⟳</div>
      <p>Loading Excel files...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  data: {
    type: Object,
    required: true
  },
  title: {
    type: String,
    default: 'Validation Results'
  }
})

const excelData = ref([])
const activeSheet = ref(0)
const loading = ref(false)

const statusClass = computed(() => {
  const status = (props.data?.status || '').toLowerCase()
  if (status.includes('success')) return 'success'
  if (status.includes('fail') || status.includes('error')) return 'error'
  if (status.includes('warning')) return 'warning'
  return 'info'
})

const statusIcon = computed(() => {
  const cls = statusClass.value
  if (cls === 'success') return '✅'
  if (cls === 'error') return '❌'
  if (cls === 'warning') return '⚠️'
  return 'ℹ️'
})

function formatDate(date) {
  if (!date) return 'Unknown'
  return new Date(date).toLocaleString()
}

async function loadExcelFiles() {
  if (!props.data.blobUrls || props.data.blobUrls.length === 0) {
    console.log('No blob URLs to load')
    return
  }

  loading.value = true
  excelData.value = []

  // Get the Speckle token from environment
  const SPECKLE_TOKEN = import.meta.env.VITE_SPECKLE_TOKEN

  try {
    for (const blob of props.data.blobUrls) {
      console.log('📥 Fetching Excel file:', blob.url)
      
      // Fetch with authentication
      const response = await fetch(blob.url, {
        headers: {
          'Authorization': `Bearer ${SPECKLE_TOKEN}`
        }
      })

      if (!response.ok) {
        console.error(`❌ Failed to fetch blob: ${response.status} ${response.statusText}`)
        continue
      }
      
      const arrayBuffer = await response.arrayBuffer()
      
      // Parse Excel file
      const workbook = window.XLSX.read(arrayBuffer, { type: 'array' })
      
      // Convert each sheet to JSON
      workbook.SheetNames.forEach((sheetName, idx) => {
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = window.XLSX.utils.sheet_to_json(worksheet, { header: 1 })
        
        if (jsonData.length > 0) {
          const headers = jsonData[0] || []
          const rows = jsonData.slice(1) || []
          
          excelData.value.push({
            name: sheetName,
            fileName: `File ${props.data.blobUrls.indexOf(blob) + 1}`,
            headers: headers,
            rows: rows
          })
          
          console.log(`✅ Loaded sheet: ${sheetName} (${rows.length} rows)`)
        }
      })
    }
  } catch (err) {
    console.error('❌ Error loading Excel files:', err)
  } finally {
    loading.value = false
  }
}


onMounted(() => {
  loadExcelFiles()
})
</script>

<style scoped>
.validation-widget {
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

/* Widget Header */
/* Removed - title now in footer */

/* Excel Section - Takes most space */
.excel-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.excel-tabs {
  display: flex;
  gap: 4px;
  padding: 8px 12px 0 12px;
  background: #f8fafc;
  border-bottom: 1px solid #d1d5db;
}

.tab-button {
  padding: 6px 12px;
  background: white;
  border: 1px solid #d1d5db;
  border-bottom: none;
  border-radius: 6px 6px 0 0;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  line-height: 1.2;
}

.tab-button:hover {
  background: #f8fafc;
  color: #3b82f6;
  border-color: #9ca3af;
}

.tab-button.active {
  background: white;
  color: #1e293b;
  border-color: #3b82f6;
  border-bottom-color: white;
  position: relative;
  bottom: -1px;
}

.excel-table-container {
  flex: 1;
  overflow: auto;
  padding: 20px;
  background: #fafafa;
}

.excel-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  border: 1px solid #d1d5db;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.excel-table th {
  position: sticky;
  top: 0;
  background: #f8fafc;
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #475569;
  border: 1px solid #d1d5db;
  white-space: nowrap;
  z-index: 10;
}

.excel-table td {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  color: #1e293b;
  background: white;
}

.excel-table tr:hover td {
  background: #f8fafc;
}

.excel-table tbody tr:nth-child(even) td {
  background: #fafbfc;
}

.excel-table tbody tr:nth-child(even):hover td {
  background: #f1f5f9;
}

/* Widget Footer */
.widget-footer {
  padding: 12px 20px;
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
  gap: 2px;
  flex: 1;
}

.widget-title {
  margin: 0;
  font-size: 15px;
  color: #1f2937;
  font-weight: 600;
  line-height: 1.3;
}

.timestamp {
  font-size: 11px;
  color: #64748b;
  line-height: 1.3;
}

.download-btn {
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
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
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
}

/* Loading State */
.loading-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #64748b;
}

.spinner {
  font-size: 48px;
  animation: spin 1.5s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
