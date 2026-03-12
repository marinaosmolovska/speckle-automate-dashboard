<template>
  <div class="validation-widget">
    <!-- Excel Table Preview (85% of space) -->
    <div v-if="excelData.length > 0" class="excel-section">
      <div class="excel-tabs" v-if="excelData.length > 1">
        <button 
          v-for="(sheet, idx) in excelData" 
          :key="idx"
          @click="activeSheet = idx"
          :class="{ active: activeSheet === idx }"
          class="tab-button"
        >
          📊 {{ sheet.name }}
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

    <!-- Compact Header and Metadata (15% of space) -->
    <div class="metadata-section">
      <div class="header-row">
        <h3>{{ title }}</h3>
        <div class="status-badge-small" :class="statusClass">
          {{ statusIcon }} {{ data.status }}
        </div>
      </div>

      <div class="metadata-grid">
        <div class="metadata-item">
          <span class="label">Function:</span>
          <span class="value">{{ data.functionName || 'Unknown' }}</span>
        </div>
        <div class="metadata-item">
          <span class="label">Run Time:</span>
          <span class="value">{{ formatDate(data.createdAt) }}</span>
        </div>
        <div class="metadata-item" v-if="data.blobUrls && data.blobUrls.length > 0">
          <span class="label">Files:</span>
          <div class="download-links">
            <a 
              v-for="(blob, idx) in data.blobUrls" 
              :key="idx"
              :href="blob.url" 
              target="_blank"
              class="download-link"
            >
              💾 File {{ idx + 1 }}
            </a>
          </div>
        </div>
      </div>

      <details class="raw-data-toggle">
        <summary>View Raw Data</summary>
        <pre>{{ JSON.stringify(data.results, null, 2) }}</pre>
      </details>
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
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 600px;
  overflow: hidden;
  border: 1.5px solid #d1d5db;
}

/* Excel Section - 85% */
.excel-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  border-bottom: 2px solid #e2e8f0;
}

.excel-tabs {
  display: flex;
  gap: 4px;
  padding: 12px 12px 0 12px;
  background: #f8fafc;
  border-bottom: 1px solid #d1d5db;
}

.tab-button {
  padding: 8px 16px;
  background: white;
  border: 1px solid #d1d5db;
  border-bottom: none;
  border-radius: 6px 6px 0 0;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
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

/* Metadata Section - 15% */
.metadata-section {
  padding: 20px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.header-row h3 {
  font-size: 16px;
  color: #1e293b;
  margin: 0;
}

.status-badge-small {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge-small.success {
  background: #dcfce7;
  color: #166534;
}

.status-badge-small.error {
  background: #fee2e2;
  color: #991b1b;
}

.status-badge-small.warning {
  background: #fef3c7;
  color: #92400e;
}

.status-badge-small.info {
  background: #dbeafe;
  color: #1e40af;
}

.metadata-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.metadata-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.metadata-item .label {
  font-size: 11px;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metadata-item .value {
  font-size: 13px;
  color: #1e293b;
  font-family: monospace;
}

.download-links {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.download-link {
  font-size: 12px;
  color: #3b82f6;
  text-decoration: none;
  font-weight: 600;
}

.download-link:hover {
  text-decoration: underline;
}

.raw-data-toggle {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
}

.raw-data-toggle summary {
  cursor: pointer;
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
  user-select: none;
}

.raw-data-toggle summary:hover {
  color: #3b82f6;
}

.raw-data-toggle pre {
  background: #1e293b;
  color: #e2e8f0;
  padding: 12px;
  border-radius: 6px;
  font-size: 11px;
  overflow-x: auto;
  margin-top: 8px;
  max-height: 200px;
  overflow-y: auto;
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

