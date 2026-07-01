// =============================================================
//  GERADOR DE DADOS DE CIDADES (roda 1x; saída vai versionada)
// =============================================================
//  Junta:
//   1) Cidades dos EUA (cidade, estado, condado, lat/lng)
//      kelvins/US-Cities-Database
//   2) Crosswalk condado -> CBSA (área metro/micropolitana)
//      mirror do arquivo de delineação do Census (toddwschneider)
//
//  Saída: public/cities/<UF>.json, agrupado por metrópole (CBSA)
//  com fallback por condado para áreas rurais. Carregado sob
//  demanda pelo CityPicker quando o cliente escolhe o estado.
//
//  Rodar: npm run build:cities
// =============================================================
import { writeFile, mkdir, readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', 'public', 'cities')
const CACHE_DIR = join(__dirname, '.cache')

const CITIES_URL = 'https://raw.githubusercontent.com/kelvins/US-Cities-Database/main/csv/us_cities.csv'
const CBSA_URL =
  'https://raw.githubusercontent.com/toddwschneider/agency-loan-level/master/data/msa_county_mapping.csv'

// ---- download com cache local (evita rebaixar a cada rodada) ----
async function fetchCsv(url, cacheName) {
  const cachePath = join(CACHE_DIR, cacheName)
  if (existsSync(cachePath)) return readFile(cachePath, 'utf8')
  console.log('Baixando', url)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Falha ao baixar ${url}: ${res.status}`)
  const text = await res.text()
  if (!existsSync(CACHE_DIR)) await mkdir(CACHE_DIR, { recursive: true })
  await writeFile(cachePath, text)
  return text
}

// ---- parser de CSV tolerante a aspas/vírgulas internas ----
function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let inQ = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQ) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else inQ = false
      } else field += c
    } else if (c === '"') inQ = true
    else if (c === ',') {
      row.push(field)
      field = ''
    } else if (c === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else if (c !== '\r') field += c
  }
  if (field.length || row.length) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

function toObjects(rows) {
  const header = rows[0].map((h) => h.replace(/^﻿/, '').trim())
  return rows.slice(1).filter((r) => r.length === header.length).map((r) => {
    const o = {}
    header.forEach((h, i) => (o[h] = r[i]))
    return o
  })
}

// Normaliza nome de condado para casar kelvins ("Suffolk") com o crosswalk ("Suffolk County").
function normCounty(s) {
  return String(s || '')
    .replace(/\s+(County|Parish|Borough|Census Area|Municipality|City and Borough|city|City)$/i, '')
    .trim()
    .toLowerCase()
}

async function main() {
  const [citiesText, cbsaText] = await Promise.all([
    fetchCsv(CITIES_URL, 'us_cities.csv'),
    fetchCsv(CBSA_URL, 'msa_county_mapping.csv'),
  ])

  // ---- mapa (UF|condado) -> { title, type, code } ----
  const cbsaRows = toObjects(parseCsv(cbsaText))
  const countyToCbsa = new Map()
  for (const r of cbsaRows) {
    const st = (r['State Abbreviation'] || '').trim()
    const county = normCounty(r['County/County Equivalent'])
    const title = (r['CBSA Title'] || '').trim()
    const isMetro = /Metropolitan/i.test(r['Metropolitan/Micropolitan Statistical Area'] || '')
    if (!st || !county || !title) continue
    countyToCbsa.set(`${st}|${county}`, {
      title,
      type: isMetro ? 'metro' : 'micro',
      code: (r['CBSA Code'] || '').trim(),
    })
  }
  console.log('CBSA: condados mapeados =', countyToCbsa.size)

  // ---- agrupa cidades por estado ----
  const cityRows = toObjects(parseCsv(citiesText))
  const byState = new Map() // st -> Map(groupKey -> { id, type, name, order, cities:Set })

  for (const r of cityRows) {
    const st = (r.STATE_CODE || '').trim()
    const name = (r.CITY || '').trim()
    const county = (r.COUNTY || '').trim()
    if (!st || !name) continue

    const cbsa = countyToCbsa.get(`${st}|${normCounty(county)}`)
    let groupKey, group
    if (cbsa) {
      groupKey = `cbsa_${cbsa.code}`
      group = { id: groupKey, type: cbsa.type, name: cbsa.title }
    } else {
      const label = /county|parish|borough|area|municipality/i.test(county) ? county : `${county} County`
      groupKey = `county_${st}_${normCounty(county)}`
      group = { id: groupKey, type: 'county', name: label || 'Outras áreas' }
    }

    if (!byState.has(st)) byState.set(st, new Map())
    const groups = byState.get(st)
    if (!groups.has(groupKey)) groups.set(groupKey, { ...group, cities: new Map() })
    // dedup por nome de cidade dentro do grupo
    groups.get(groupKey).cities.set(name.toLowerCase(), { name, county })
  }

  if (!existsSync(OUT_DIR)) await mkdir(OUT_DIR, { recursive: true })

  const typeRank = { metro: 0, micro: 1, county: 2 }
  let totalCities = 0
  const summary = []

  for (const [st, groupsMap] of byState) {
    const groups = [...groupsMap.values()].map((g) => ({
      id: g.id,
      type: g.type,
      name: g.name,
      cities: [...g.cities.values()].sort((a, b) => a.name.localeCompare(b.name)),
    }))

    // metros primeiro (mais cidades no topo), depois micros, depois condados (alfabético)
    groups.sort((a, b) => {
      if (typeRank[a.type] !== typeRank[b.type]) return typeRank[a.type] - typeRank[b.type]
      if (a.type === 'county') return a.name.localeCompare(b.name)
      return b.cities.length - a.cities.length
    })

    const count = groups.reduce((n, g) => n + g.cities.length, 0)
    totalCities += count
    summary.push(`${st}: ${groups.length} grupos, ${count} cidades`)

    await writeFile(join(OUT_DIR, `${st}.json`), JSON.stringify({ state: st, groups }))
  }

  console.log(summary.sort().join('\n'))
  console.log(`\nOK — ${byState.size} estados, ${totalCities} cidades em ${OUT_DIR}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
