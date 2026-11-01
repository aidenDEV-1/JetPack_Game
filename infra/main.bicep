param location string = resourceGroup().location
param namePrefix string = 'dex-5pm-rush'
param companyTenantId string
param cosmosServerless bool = true
param staticWebAppSku string = 'Free'

var cosmosAccountName = replace('${namePrefix}-cosmos', '-', '')
var storageName = take(replace('${namePrefix}storage', '-', ''), 24)
var functionName = '${namePrefix}-api'
var staticAppName = '${namePrefix}-web'
var keyVaultName = '${namePrefix}-kv'
var appInsightsName = '${namePrefix}-insights'
var cosmosContributorRoleId = '00000000-0000-0000-0000-000000000002'
var keyVaultSecretsUserRoleId = '4633458b-17de-408a-b874-0445c86b69e6'

resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
  }
}

resource storage 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: storageName
  location: location
  sku: { name: 'Standard_LRS' }
  kind: 'StorageV2'
  properties: { minimumTlsVersion: 'TLS1_2' }
}

resource plan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: '${namePrefix}-plan'
  location: location
  kind: 'functionapp'
  sku: { name: 'Y1', tier: 'Dynamic' }
  properties: { reserved: true }
}

resource cosmos 'Microsoft.DocumentDB/databaseAccounts@2024-05-15' = {
  name: cosmosAccountName
  location: location
  kind: 'GlobalDocumentDB'
  properties: {
    databaseAccountOfferType: 'Standard'
    capabilities: cosmosServerless ? [{ name: 'EnableServerless' }] : []
    consistencyPolicy: { defaultConsistencyLevel: 'Session' }
    locations: [{ locationName: location, failoverPriority: 0, isZoneRedundant: false }]
    disableLocalAuth: true
  }
}

resource cosmosDatabase 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases@2024-05-15' = {
  parent: cosmos
  name: 'jetpack-game'
  properties: { resource: { id: 'jetpack-game' } }
}

resource recordsContainer 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2024-05-15' = {
  parent: cosmosDatabase
  name: 'player-records'
  properties: {
    resource: {
      id: 'player-records'
      partitionKey: { paths: ['/userId'], kind: 'Hash' }
      indexingPolicy: { indexingMode: 'consistent', automatic: true }
    }
  }
}

resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: keyVaultName
  location: location
  properties: {
    tenantId: companyTenantId
    enableRbacAuthorization: true
    enableSoftDelete: true
    sku: { family: 'A', name: 'standard' }
  }
}

resource functionApp 'Microsoft.Web/sites@2023-12-01' = {
  name: functionName
  location: location
  kind: 'functionapp,linux'
  identity: { type: 'SystemAssigned' }
  properties: {
    serverFarmId: plan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'Node|22'
      appSettings: [
        { name: 'FUNCTIONS_WORKER_RUNTIME', value: 'node' }
        { name: 'FUNCTIONS_EXTENSION_VERSION', value: '~4' }
        { name: 'APPLICATIONINSIGHTS_CONNECTION_STRING', value: appInsights.properties.ConnectionString }
        { name: 'COSMOS_ENDPOINT', value: cosmos.properties.documentEndpoint }
        { name: 'COSMOS_DATABASE', value: 'jetpack-game' }
        { name: 'COSMOS_CONTAINER', value: 'player-records' }
        { name: 'COMPANY_TENANT_ID', value: companyTenantId }
        { name: 'KEY_VAULT_URI', value: keyVault.properties.vaultUri }
      ]
    }
  }
}

resource cosmosRole 'Microsoft.DocumentDB/databaseAccounts/sqlRoleAssignments@2024-05-15' = {
  parent: cosmos
  name: guid(cosmos.id, functionApp.id, cosmosContributorRoleId)
  properties: {
    roleDefinitionId: '${cosmos.id}/sqlRoleDefinitions/${cosmosContributorRoleId}'
    principalId: functionApp.identity.principalId
    scope: cosmos.id
  }
}

resource keyVaultRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(keyVault.id, functionApp.identity.principalId, keyVaultSecretsUserRoleId)
  scope: keyVault
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', keyVaultSecretsUserRoleId)
    principalId: functionApp.identity.principalId
    principalType: 'ServicePrincipal'
  }
}

resource staticApp 'Microsoft.Web/staticSites@2023-12-01' = {
  name: staticAppName
  location: location
  sku: { name: staticWebAppSku, tier: staticWebAppSku }
  properties: {
    stagingEnvironmentPolicy: 'Enabled'
    allowConfigFileUpdates: true
  }
}

output staticWebAppName string = staticApp.name
output functionAppName string = functionApp.name
output cosmosEndpoint string = cosmos.properties.documentEndpoint
output keyVaultUri string = keyVault.properties.vaultUri