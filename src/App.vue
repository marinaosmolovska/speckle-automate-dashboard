<template>
  <div class="dashboard">
    <header class="header">
      <div class="header-content">
        <h1>🏗️ Hyperbuilding Program Analysis</h1>
        <p class="subtitle">Real-time data from Speckle Automate</p>
      </div>
      <div class="header-actions">
        <button @click="refreshData" class="refresh-btn" :disabled="loading">
          <span class="spinner" v-if="loading">⟳</span>
          <span v-else>🔄</span>
          {{ loading ? 'Loading...' : 'Refresh' }}
        </button>
        <div class="status-badge" :class="statusClass">
          {{ statusText }}
        </div>
      </div>
    </header>

    <div v-if="!isConfigured" class="config-panel">
      <div class="config-card">
        <h2>⚠️ Configuration Missing</h2>
        <p class="config-intro">
          Environment variables not found. Please check your <code>.env</code> file.
        </p>
        
        <div class="config-status">
          <div class="status-item" :class="{ missing: !configStatus.token }">
            <span class="icon">{{ configStatus.token ? '✅' : '❌' }}</span>
            <span>VITE_SPECKLE_TOKEN</span>
          </div>
          <div class="status-item" :class="{ missing: !configStatus.projectId }">
            <span class="icon">{{ configStatus.projectId ? '✅' : '❌' }}</span>
            <span>VITE_PROJECT_ID</span>
          </div>
          <div class="status-item" :class="{ missing: !configStatus.modelId }">
            <span class="icon">{{ configStatus.modelId ? '✅' : '❌' }}</span>
            <span>VITE_MODEL_ID</span>
          </div>
          <div class="status-item" :class="{ missing: !configStatus.pieChartFn }">
            <span class="icon">{{ configStatus.pieChartFn ? '✅' : '❌' }}</span>
            <span>VITE_PIE_CHART_FUNCTION_ID</span>
          </div>
          <div class="status-item" :class="{ missing: !configStatus.validatorFn }">
            <span class="icon">{{ configStatus.validatorFn ? '✅' : '❌' }}</span>
            <span>VITE_VALIDATOR_FUNCTION_ID</span>
          </div>
        </div>

        <div class="help-box">
          <strong>📝 Setup Instructions:</strong>
          <ol>
            <li>Copy <code>.env.example</code> to <code>.env</code></li>
            <li>Get your Speckle token from: <br>
              <a href="https://app.speckle.systems" target="_blank">
                app.speckle.systems → Profile → Developer Settings → Tokens
              </a>
            </li>
            <li>Fill in all values in <code>.env</code></li>
            <li>Restart the dev server: <code>npm run dev</code></li>
          </ol>
          
          <div class="id-finder" v-if="showIdFinder">
            <h4>🔍 Function ID Finder</h4>
            <p>Enable this in your .env to see all function IDs:</p>
            <code>VITE_SHOW_FUNCTION_IDS=true</code>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="error" class="error-panel">
      <div class="error-card">
        <h3>❌ Error Loading Data</h3>
        <p class="error-message">{{ error }}</p>
        <div class="error-actions">
          <button @click="refreshData" class="btn-primary">Try Again</button>
        </div>
      </div>
    </div>

    <div v-else class="dashboard-content">
      <div v-if="loading && !hasData" class="loading-panel">
        <div class="spinner-large">⟳</div>
        <p>Loading automation results...</p>
      </div>

      <div v-else class="dashboard-grid">
        <!-- Left Column: 3D Viewer (Large) -->
        <div class="grid-left">
          <SpeckleViewer
            :projectId="config.projectId"
            :modelId="config.modelId"
          />
        </div>

        <!-- Right Column: Two Stacked Widgets -->
        <div class="grid-right">
          <!-- Top Right: Pie Chart Widget -->
          <div class="grid-top-right">
            <ImageWidget
              v-if="pieChartImageUrl"
              :imageUrl="pieChartImageUrl"
              :title="pieChartTitle"
              :description="pieChartDescription"
            />
            <div v-else class="widget-placeholder">
              <div class="placeholder-icon">📊</div>
              <h3>Pie Chart Visualization</h3>
              <p>No pie chart image found in latest run</p>
              <p class="placeholder-hint">
                Function ID: <code>{{ config.pieChartFunctionId || 'Not set' }}</code>
              </p>
            </div>
          </div>

          <!-- Bottom Right: Excel/Validator Widget -->
          <div class="grid-bottom-right">
            <ValidationWidget
              v-if="validatorResults"
              :data="validatorResults"
              :title="validatorTitle"
            />
            <div v-else class="widget-placeholder">
              <div class="placeholder-icon">✅</div>
              <h3>Type Based Program Floor Validator</h3>
              <p>No validation results found in latest run</p>
              <p class="placeholder-hint">
                Function ID: <code>{{ config.validatorFunctionId || 'Not set' }}</code>
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Function ID Finder (only shows if VITE_SHOW_FUNCTION_IDS=true) -->
      <div v-if="showIdFinder && automateResults?.functionRuns" class="id-finder-panel">
        <div class="finder-header">
          <h3>🔍 Function ID Finder - Use these IDs in your .env file</h3>
        </div>
        <div class="finder-content">
          <p class="finder-intro">
            Copy the function IDs below into your <code>.env</code> file:
          </p>
          
          <div v-if="automateResults?.functionRuns" class="function-list">
            <div v-for="(run, idx) in automateResults.functionRuns" :key="idx" class="function-card">
              <div class="function-header">
                <h4>{{ run.functionName }}</h4>
                <span class="status-badge" :class="run.status.toLowerCase()">
                  {{ run.status }}
                </span>
              </div>
              
              <div class="function-details">
                <div class="id-row">
                  <strong>Function ID:</strong>
                  <code class="copyable" @click="copyToClipboard(run.functionId)">
                    {{ run.functionId }}
                  </code>
                  <button @click="copyToClipboard(run.functionId)" class="copy-btn">
                    📋 Copy
                  </button>
                </div>
                
                <div class="env-example">
                  <strong>Use in .env as:</strong>
                  <pre @click="copyToClipboard(getEnvLine(run))">{{ getEnvLine(run) }}</pre>
                </div>
                
                <div v-if="run.status === 'SUCCEEDED'" class="blob-info">
                  <p>Has {{ getBlobCount(run) }} blob attachment(s)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <details class="debug-panel" v-if="automateResults">
        <summary>🔍 Debug Information</summary>
        <div class="debug-content">
          <h4>Latest Automation Run</h4>
          <p><strong>Run ID:</strong> {{ automateResults.id }}</p>
          <p><strong>Status:</strong> {{ automateResults.status }}</p>
          <p><strong>Created:</strong> {{ new Date(automateResults.createdAt).toLocaleString() }}</p>
          <p><strong>Function Runs:</strong> {{ automateResults.functionRuns?.length || 0 }}</p>
          
          <h4>Function Details</h4>
          <div v-for="(run, idx) in automateResults.functionRuns" :key="idx" class="debug-function">
            <p><strong>Function {{ idx + 1 }}:</strong></p>
            <p>• ID: <code>{{ run.functionId }}</code></p>
            <p>• Name: {{ run.functionName }}</p>
            <p>• Status: {{ run.status }}</p>
          </div>

          <div v-if="pieChartImageUrl" class="debug-function" style="background: #dcfce7; border: 2px solid #16a34a;">
            <p><strong>✅ Pie Chart Source:</strong></p>
            <p>• Function: {{ pieChartTitle }}</p>
            <p>• URL: <code>{{ pieChartImageUrl }}</code></p>
          </div>
          
          <div v-if="validatorResults" class="debug-function" style="background: #dbeafe; border: 2px solid #3b82f6;">
            <p><strong>✅ Validator Source:</strong></p>
            <p>• Function: {{ validatorTitle }}</p>
            <p>• Blobs: {{ validatorResults.blobUrls?.length || 0 }}</p>
          </div>
        </div>
      </details>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSpeckleData } from './composables/useSpeckleData'
import ImageWidget from './components/ImageWidget.vue'
import ValidationWidget from './components/ValidationWidget.vue'
import SpeckleViewer from './components/SpeckleViewer.vue'

// Load configuration from environment variables
const config = ref({
  projectId: import.meta.env.VITE_PROJECT_ID,
  modelId: import.meta.env.VITE_MODEL_ID,
  pieChartFunctionId: import.meta.env.VITE_PIE_CHART_FUNCTION_ID,
  validatorFunctionId: import.meta.env.VITE_VALIDATOR_FUNCTION_ID
})

// Show function ID finder if enabled
const showIdFinder = import.meta.env.VITE_SHOW_FUNCTION_IDS === 'true'

// Check configuration status
const configStatus = computed(() => ({
  token: !!import.meta.env.VITE_SPECKLE_TOKEN,
  projectId: !!config.value.projectId,
  modelId: !!config.value.modelId,
  pieChartFn: !!config.value.pieChartFunctionId,
  validatorFn: !!config.value.validatorFunctionId
}))

const isConfigured = computed(() => 
  configStatus.value.token &&
  configStatus.value.projectId &&
  configStatus.value.modelId &&
  configStatus.value.pieChartFn &&
  configStatus.value.validatorFn
)

console.log('🔧 Configuration Status:')
console.log('   Token:', configStatus.value.token ? '✅' : '❌')
console.log('   Project ID:', configStatus.value.projectId ? '✅' : '❌')
console.log('   Model ID:', configStatus.value.modelId ? '✅' : '❌')
console.log('   Pie Chart Function:', configStatus.value.pieChartFn ? '✅' : '❌', config.value.pieChartFunctionId)
console.log('   Validator Function:', configStatus.value.validatorFn ? '✅' : '❌', config.value.validatorFunctionId)

const { loading, error, automateResults, fetchAutomateResults } = useSpeckleData()

const pieChartImageUrl = ref(null)
const pieChartTitle = ref('Program Distribution')
const pieChartDescription = ref('Visualization from Speckle Automate')
const validatorResults = ref(null)
const validatorTitle = ref('Type Based Program Floor Validator')

const hasData = computed(() => pieChartImageUrl.value || validatorResults.value)

const statusText = computed(() => {
  if (loading.value) return 'Loading...'
  if (error.value) return 'Error'
  if (!automateResults.value) return 'No data'
  const date = new Date(automateResults.value.createdAt)
  return `Updated ${date.toLocaleTimeString()}`
})

const statusClass = computed(() => {
  if (loading.value) return 'loading'
  if (error.value) return 'error'
  if (!automateResults.value) return 'pending'
  const status = automateResults.value.status || ''
  if (status.toLowerCase().includes('success')) return 'success'
  if (status.toLowerCase().includes('fail')) return 'error'
  return 'pending'
})

// Helper functions for ID finder
function getBlobCount(run) {
  try {
    const results = typeof run.results === 'string' ? JSON.parse(run.results) : run.results
    return results?.values?.blobIds?.length || 0
  } catch {
    return 0
  }
}

function getEnvLine(run) {
  const varName = run.functionName.toLowerCase().includes('pie') || 
                  run.functionName.toLowerCase().includes('chart') ||
                  run.functionName.toLowerCase().includes('visualization')
    ? 'VITE_PIE_CHART_FUNCTION_ID'
    : run.functionName.toLowerCase().includes('validator')
    ? 'VITE_VALIDATOR_FUNCTION_ID'
    : 'VITE_FUNCTION_ID'
  
  return `${varName}=${run.functionId}`
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert(`Copied: ${text}`)
  }).catch(() => {
    alert(`Failed to copy. Please copy manually: ${text}`)
  })
}

async function parseAutomateResults(results) {
  if (!results || !results.functionRuns) {
    console.warn('⚠️ No function runs found')
    return
  }

  console.log('📦 Processing automation run:', results.id)
  console.log(`   Found ${results.functionRuns.length} function(s)`)
  
  pieChartImageUrl.value = null
  validatorResults.value = null

  for (const [index, run] of results.functionRuns.entries()) {
    console.log(`\n🔍 Function ${index + 1}:`)
    console.log(`   ID: ${run.functionId}`)
    console.log(`   Name: ${run.functionName}`)
    console.log(`   Status: ${run.status}`)
    
    try {
      const parsedResults = typeof run.results === 'string' 
        ? JSON.parse(run.results) 
        : (run.results || {})
      
      console.log('   📦 Results:', parsedResults)

      // Check for blobIds and fetch them
      let blobUrls = []
      if (parsedResults.values?.blobIds && Array.isArray(parsedResults.values.blobIds)) {
        console.log(`   🔗 Found ${parsedResults.values.blobIds.length} blob IDs`)
        
        // Fetch blob metadata from Speckle
        for (const blobId of parsedResults.values.blobIds) {
          const blobUrl = `https://app.speckle.systems/api/stream/${config.value.projectId}/blob/${blobId}`
          console.log(`   📥 Blob URL: ${blobUrl}`)
          blobUrls.push({
            id: blobId,
            url: blobUrl
          })
        }
      }

      // PIE CHART FUNCTION - Match by exact function ID
      if (run.functionId === config.value.pieChartFunctionId) {
        console.log('   ✅ MATCHED: Pie Chart Function!')
        
        if (blobUrls.length > 0) {
          // Use the first blob as the pie chart image (same pattern as validator)
          pieChartImageUrl.value = blobUrls[0].url
          pieChartTitle.value = run.functionName
          pieChartDescription.value = `Generated: ${new Date(run.createdAt).toLocaleString()}`
          console.log('   📊 Pie chart image:', blobUrls[0].url)
        } else {
          console.warn('   ⚠️ No image blobs found for pie chart')
        }
      }
      
      // VALIDATOR FUNCTION - Match by exact function ID (keep existing logic)
      if (run.functionId === config.value.validatorFunctionId) {
        console.log('   ✅ MATCHED: Validator Function!')
        
        // Add blob URLs to results (exact same pattern as before)
        validatorResults.value = {
          functionId: run.functionId,
          functionName: run.functionName,
          status: run.status,
          statusMessage: run.statusMessage || '',
          results: parsedResults,
          values: parsedResults.values || {},
          markdownMessage: parsedResults.markdownMessage || '',
          objectResults: parsedResults.objectResults || [],
          blobUrls: blobUrls,
          createdAt: run.createdAt
        }
        
        validatorTitle.value = run.functionName
        console.log('   ✅ Validator results loaded')
        console.log(`   📊 Blob URLs: ${blobUrls.length}`)
      }
      
    } catch (err) {
      console.error(`   ❌ Error parsing function ${index + 1}:`, err)
    }
  }

  console.log('\n📊 Dashboard Summary:')
  console.log(`   Pie Chart: ${pieChartImageUrl.value ? '✅' : '❌'}`)
  console.log(`   Validator: ${validatorResults.value ? '✅' : '❌'}`)
}

async function loadData() {
  console.log('🔄 Fetching automation results...')
  const results = await fetchAutomateResults(config.value.projectId, config.value.modelId)
  if (results) await parseAutomateResults(results)
}

async function refreshData() {
  pieChartImageUrl.value = null
  validatorResults.value = null
  await loadData()
}

onMounted(() => {
  if (isConfigured.value) {
    console.log('✅ Configuration complete, loading data...')
    loadData()
    setInterval(() => {
      console.log('🔄 Auto-refresh')
      loadData()
    }, 60000)
  } else {
    console.log('⚠️ Configuration incomplete')
  }
})
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  height: 100vh;
  background: #fafbfc;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  background: #1f2937;
  padding: 16px 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.header-content {
  display: flex;
  flex-direction: column;
}

.header-content h1 {
  font-size: 22px;
  color: #ffffff;
  margin: 0;
  font-weight: 600;
}

.subtitle {
  font-size: 13px;
  color: #d1d5db;
  margin: 4px 0 0 0;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.refresh-btn {
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: 1px solid #60a5fa;
  border-radius: 6px;
  font-weight: 500;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.refresh-btn:hover:not(:disabled) {
  background: #2563eb;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  display: inline-block;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.status-badge {
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 12px;
  white-space: nowrap;
  background: rgba(255,255,255,0.1);
  color: #e5e7eb;
}

.status-badge.success,
.status-badge.succeeded {
  background: #dcfce7;
  color: #166534;
}

.status-badge.error,
.status-badge.failed {
  background: #fee2e2;
  color: #991b1b;
}

.status-badge.loading,
.status-badge.pending {
  background: rgba(255,255,255,0.1);
  color: #e5e7eb;
}

.config-panel {
  padding: 40px 20px;
  max-width: 800px;
  margin: 0 auto;
  flex: 1;
  display: flex;
  align-items: center;
}

.config-card {
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  width: 100%;
}

.config-card h2 {
  font-size: 24px;
  color: #dc2626;
  margin-bottom: 12px;
}

.config-intro {
  color: #64748b;
  margin-bottom: 32px;
  line-height: 1.6;
}

.config-intro code {
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: monospace;
}

.config-status {
  background: #f8fafc;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  margin: 4px 0;
  border-radius: 6px;
  font-family: monospace;
  font-size: 14px;
}

.status-item .icon {
  font-size: 18px;
}

.status-item.missing {
  background: #fee2e2;
  color: #991b1b;
}

.help-box {
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
}

.help-box strong {
  display: block;
  margin-bottom: 12px;
  color: #1e293b;
}

.help-box ol {
  margin-left: 20px;
  color: #475569;
  line-height: 2;
}

.help-box code {
  background: #e2e8f0;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: monospace;
  font-size: 13px;
}

.help-box a {
  color: #3b82f6;
  text-decoration: none;
}

.help-box a:hover {
  text-decoration: underline;
}

.id-finder {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 2px solid #e2e8f0;
}

.id-finder h4 {
  margin-bottom: 8px;
  color: #1e293b;
}

.error-panel {
  padding: 40px 20px;
  max-width: 600px;
  margin: 0 auto;
  flex: 1;
  display: flex;
  align-items: center;
}

.error-card {
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  text-align: center;
  width: 100%;
}

.error-card h3 {
  color: #dc2626;
  margin-bottom: 16px;
}

.error-message {
  color: #64748b;
  margin-bottom: 24px;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn-primary {
  padding: 10px 24px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.dashboard-content {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 0;
}

.loading-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #64748b;
}

.spinner-large {
  font-size: 48px;
  animation: spin 1.5s linear infinite;
  margin-bottom: 16px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1.7fr 1.3fr;
  gap: 0;
  height: 100%;
  width: 100%;
}

.grid-left {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 0;
  overflow: hidden;
}

.grid-right {
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 0;
  height: 100%;
  min-width: 0;
}

.grid-top-right,
.grid-bottom-right {
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.grid-bottom-right {
  overflow-y: auto;
}

@media (max-width: 1400px) {
  .header-content h1 {
    font-size: 20px;
  }

  .subtitle {
    font-size: 12px;
  }

  .refresh-btn {
    padding: 6px 12px;
    font-size: 12px;
  }
}

@media (max-width: 1200px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
    height: auto;
  }

  .grid-left,
  .grid-right {
    height: auto;
    min-height: 400px;
  }

  .grid-right {
    grid-template-rows: auto auto;
  }

  .dashboard-content {
    padding: 12px;
  }

  .dashboard-grid {
    gap: 12px;
  }
}

.widget-placeholder {
  background: white;
  padding: 60px 40px;
  border-radius: 8px;
  border: 1.5px solid #d1d5db;
  text-align: center;
  color: #6b7280;
}

.placeholder-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.widget-placeholder h3 {
  color: #334155;
  margin-bottom: 12px;
  font-size: 18px;
}

.widget-placeholder p {
  margin: 8px 0;
  font-size: 14px;
}

.placeholder-hint {
  margin-top: 16px;
  font-size: 12px;
  color: #9ca3af;
}

.placeholder-hint code {
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: monospace;
}

/* Function ID Finder Panel */
.id-finder-panel {
  max-width: 1600px;
  margin: 24px auto 0;
  background: white;
  border-radius: 12px;
  padding: 24px;
  border: 3px solid #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.finder-header {
  margin-bottom: 20px;
}

.finder-header h3 {
  color: #1f2937;
  font-size: 18px;
  margin: 0;
}

.finder-content {
  margin-top: 0;
}

.finder-intro {
  margin-bottom: 20px;
  color: #64748b;
}

.function-list {
  display: grid;
  gap: 16px;
}

.function-card {
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
}

.function-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.function-header h4 {
  margin: 0;
  color: #1f2937;
  font-size: 16px;
}

.function-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.id-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.id-row strong {
  min-width: 100px;
  color: #475569;
  font-size: 14px;
}

.copyable {
  background: #e2e8f0;
  padding: 6px 12px;
  border-radius: 6px;
  font-family: monospace;
  font-size: 13px;
  cursor: pointer;
  flex: 1;
}

.copyable:hover {
  background: #cbd5e1;
}

.copy-btn {
  padding: 6px 12px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
}

.copy-btn:hover {
  background: #2563eb;
}

.env-example {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.env-example strong {
  color: #475569;
  font-size: 14px;
}

.env-example pre {
  background: #1f2937;
  color: #f3f4f6;
  padding: 12px;
  border-radius: 6px;
  font-family: monospace;
  font-size: 13px;
  cursor: pointer;
  margin: 0;
}

.env-example pre:hover {
  background: #374151;
}

.blob-info {
  color: #16a34a;
  font-size: 13px;
  font-weight: 500;
}

.debug-panel {
  max-width: 1600px;
  margin: 24px auto 0;
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e2e8f0;
}

.debug-panel summary {
  cursor: pointer;
  font-weight: 600;
  color: #64748b;
  user-select: none;
  font-size: 14px;
}

.debug-panel summary:hover {
  color: #3b82f6;
}

.debug-content {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.debug-content h4 {
  font-size: 14px;
  color: #475569;
  margin: 16px 0 8px 0;
}

.debug-content p {
  font-size: 13px;
  color: #64748b;
  margin: 4px 0;
  font-family: monospace;
}

.debug-function {
  background: #f8fafc;
  padding: 12px;
  border-radius: 6px;
  margin: 8px 0;
}

.debug-function code {
  background: #e2e8f0;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
}
</style>
