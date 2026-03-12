import { ref } from 'vue'

export function useSpeckleData() {
  const loading = ref(false)
  const error = ref(null)
  const automateResults = ref(null)

  const SPECKLE_SERVER = 'https://app.speckle.systems'
  const SPECKLE_TOKEN = import.meta.env.VITE_SPECKLE_TOKEN
  
  async function fetchAutomateResults(projectId, modelId) {
    loading.value = true
    error.value = null
    automateResults.value = null

    console.log('🌐 Connecting to Speckle...')
    console.log(`   Project: ${projectId}`)

    if (!SPECKLE_TOKEN) {
      error.value = 'Missing token'
      loading.value = false
      return null
    }

    try {
      // Query project-level automations (not model-specific)
      const query = `
        query GetProjectAutomations($projectId: String!) {
          project(id: $projectId) {
            id
            name
            automations(limit: 10) {
              items {
                id
                name
                enabled
                runs(limit: 1) {
                  items {
                    id
                    status
                    createdAt
                    functionRuns {
                      id
                      functionId
                      function {
                        id
                        name
                      }
                      status
                      statusMessage
                      results
                    }
                  }
                }
              }
            }
          }
        }
      `

      const response = await fetch(`${SPECKLE_SERVER}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SPECKLE_TOKEN}`
        },
        body: JSON.stringify({
          query,
          variables: { projectId }
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      
      if (data.errors) {
        console.error('GraphQL Errors:', data.errors)
        throw new Error(data.errors.map(e => e.message).join(', '))
      }

      const automations = data.data?.project?.automations?.items
      
      if (!automations || automations.length === 0) {
        throw new Error('No automations found')
      }

      console.log(`✅ Found ${automations.length} automations`)

      // Collect all function runs from all automations
      const allFunctionRuns = []
      
      automations.forEach(automation => {
        console.log(`   Automation: ${automation.name}`)
        
        if (automation.runs?.items?.[0]?.functionRuns) {
          const runs = automation.runs.items[0].functionRuns
          
          // Add functionName from nested function object
          runs.forEach(fr => {
            allFunctionRuns.push({
              ...fr,
              functionName: fr.function?.name || 'Unknown',
              automationName: automation.name,
              createdAt: automation.runs.items[0].createdAt
            })
          })
        }
      })

      if (allFunctionRuns.length === 0) {
        throw new Error('No function runs found')
      }

      // Create a combined result object
      const combinedResult = {
        id: 'combined',
        status: 'SUCCEEDED',
        createdAt: allFunctionRuns[0].createdAt,
        functionRuns: allFunctionRuns
      }

      automateResults.value = combinedResult

      console.log('✅ Loaded successfully')
      console.log(`   Total functions: ${allFunctionRuns.length}`)
      allFunctionRuns.forEach(fr => {
        console.log(`   - ${fr.functionName} (${fr.functionId})`)
      })

      return combinedResult

    } catch (err) {
      error.value = err.message
      console.error('❌ Error:', err.message)
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    automateResults,
    fetchAutomateResults
  }
}
