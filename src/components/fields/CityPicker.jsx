import { useEffect, useMemo, useState } from 'react'
import { Search, ChevronDown, X, MapPin, Loader2, Check } from 'lucide-react'
import Select from './Select'
import { cx } from '../../lib/cx'
import { inputBase } from './styles'
import { cityKey } from '../../state/draft'
import { US_STATES } from '../../data/states'

const stateOptions = US_STATES.map((s) => ({ value: s.abbr, label: `${s.name} (${s.abbr})` }))
const TYPE_LABEL = { metro: 'Metro', micro: 'Micro', county: 'Condado' }

// cache de estados já carregados (troca de estado fica instantânea)
const cache = new Map()
async function loadCities(st) {
  if (cache.has(st)) return cache.get(st)
  const res = await fetch(`${import.meta.env.BASE_URL}cities/${st}.json`)
  if (!res.ok) throw new Error('Falha ao carregar a lista de cidades.')
  const data = await res.json()
  cache.set(st, data)
  return data
}

const mkCity = (city, group, st) => ({ name: city.name, state: st, county: city.county, group: group.name })

export default function CityPicker({ value = [], onChange, limit, defaultState = '', state, onStateChange, error: stateError }) {
  // Estado controlado (persistido no draft) se `state`/`onStateChange` vierem;
  // senão, cai num estado interno (uso sem exigência de validação, ex.: LSA).
  const isControlled = state !== undefined
  const [internalState, setInternalState] = useState(defaultState)
  const activeState = isControlled ? state : internalState
  const setActiveState = isControlled ? onStateChange : setInternalState
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState({}) // accordion: groupId -> bool

  useEffect(() => {
    if (!activeState) {
      setData(null)
      return
    }
    let alive = true
    setLoading(true)
    setError('')
    loadCities(activeState)
      .then((d) => {
        if (!alive) return
        setData(d)
        setOpen(d.groups[0] ? { [d.groups[0].id]: true } : {})
      })
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [activeState])

  const selectedKeys = useMemo(() => new Set(value.map(cityKey)), [value])
  const atLimit = limit ? value.length >= limit : false

  function toggleCity(city, group) {
    const c = mkCity(city, group, activeState)
    const key = cityKey(c)
    if (selectedKeys.has(key)) onChange(value.filter((x) => cityKey(x) !== key))
    else if (!atLimit) onChange([...value, c])
  }

  function addAll(group) {
    const additions = group.cities
      .map((city) => mkCity(city, group, activeState))
      .filter((c) => !selectedKeys.has(cityKey(c)))
    onChange([...value, ...additions])
  }
  function removeGroup(group) {
    const groupKeys = new Set(group.cities.map((city) => cityKey(mkCity(city, group, activeState))))
    onChange(value.filter((c) => !groupKeys.has(cityKey(c))))
  }

  // Busca global achata as cidades de todos os grupos.
  const results = useMemo(() => {
    if (!data || !query.trim()) return null
    const q = query.trim().toLowerCase()
    const out = []
    for (const g of data.groups)
      for (const city of g.cities)
        if (city.name.toLowerCase().includes(q)) out.push({ city, group: g })
    return out.slice(0, 120)
  }, [data, query])

  return (
    <div className="space-y-3">
      <Select
        label="Estado"
        value={activeState}
        onChange={setActiveState}
        options={stateOptions}
        placeholder="Escolha o estado para listar as cidades"
        help={stateError ? undefined : 'Pode trocar de estado e continuar adicionando — as selecionadas ficam guardadas.'}
        error={stateError}
      />

      {activeState && (
        <div className="overflow-hidden rounded-xl border border-stone-200 dark:border-stone-800">
          {/* Busca + contador */}
          <div className="flex items-center gap-2 border-b border-stone-200 bg-stone-50 p-2 dark:border-stone-800 dark:bg-stone-800/50">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" size={15} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar cidade…"
                className={cx(inputBase, 'py-1.5 pl-8 text-sm')}
              />
            </div>
            <span
              className={cx(
                'shrink-0 rounded-lg px-2 py-1 text-xs font-bold',
                atLimit ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400' : 'bg-stone-200 text-stone-600 dark:bg-stone-700 dark:text-stone-200',
              )}
            >
              {value.length}
              {limit ? `/${limit}` : ''}
            </span>
          </div>

          {/* Lista */}
          <div className="max-h-80 overflow-auto scrollbar-thin p-1.5">
            {loading && (
              <div className="flex items-center justify-center gap-2 py-8 text-sm text-stone-400">
                <Loader2 className="animate-spin" size={16} /> Carregando cidades…
              </div>
            )}
            {error && <div className="px-2 py-6 text-center text-sm text-rose-500">{error}</div>}

            {!loading && !error && results && (
              <div className="space-y-0.5">
                {results.length === 0 && (
                  <p className="px-2 py-6 text-center text-sm text-stone-400">Nenhuma cidade encontrada.</p>
                )}
                {results.map(({ city, group }) => (
                  <CityRow
                    key={`${group.id}-${city.name}`}
                    city={city}
                    selected={selectedKeys.has(cityKey(mkCity(city, group, activeState)))}
                    disabled={atLimit && !selectedKeys.has(cityKey(mkCity(city, group, activeState)))}
                    onToggle={() => toggleCity(city, group)}
                    subtitle={group.name}
                  />
                ))}
              </div>
            )}

            {!loading && !error && !results && data && (
              <div className="space-y-1">
                {data.groups.map((g) => {
                  const isOpen = !!open[g.id]
                  const selectedInGroup = g.cities.reduce(
                    (n, city) => n + (selectedKeys.has(cityKey(mkCity(city, g, activeState))) ? 1 : 0),
                    0,
                  )
                  return (
                    <div key={g.id} className="rounded-lg border border-stone-200 dark:border-stone-800">
                      <button
                        type="button"
                        onClick={() => setOpen((o) => ({ ...o, [g.id]: !o[g.id] }))}
                        className="flex w-full items-center gap-2 px-2.5 py-2 text-left"
                      >
                        <ChevronDown
                          size={15}
                          className={cx('shrink-0 text-stone-400 transition-transform', isOpen && 'rotate-180')}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-stone-700 dark:text-stone-200">
                            {g.name}
                          </span>
                          <span className="text-[11px] text-stone-400">
                            {TYPE_LABEL[g.type]} · {g.cities.length} cidades
                            {selectedInGroup > 0 && ` · ${selectedInGroup} selecionada(s)`}
                          </span>
                        </span>
                        {!limit && (
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                              e.stopPropagation()
                              selectedInGroup === g.cities.length ? removeGroup(g) : addAll(g)
                            }}
                            className="shrink-0 rounded-md px-2 py-1 text-[11px] font-semibold text-sky-600 hover:bg-sky-50 dark:text-sky-400 dark:hover:bg-sky-500/10"
                          >
                            {selectedInGroup === g.cities.length ? 'Limpar' : 'Todas'}
                          </span>
                        )}
                      </button>

                      {isOpen && (
                        <div className="grid grid-cols-1 gap-0.5 border-t border-stone-100 p-1.5 sm:grid-cols-2 dark:border-stone-800">
                          {g.cities.map((city) => {
                            const key = cityKey(mkCity(city, g, activeState))
                            const sel = selectedKeys.has(key)
                            return (
                              <CityRow
                                key={city.name}
                                city={city}
                                selected={sel}
                                disabled={atLimit && !sel}
                                onToggle={() => toggleCity(city, g)}
                              />
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bandeja de selecionados */}
      {value.length > 0 && (
        <div className="rounded-xl border border-stone-200 bg-white p-2.5 dark:border-stone-800 dark:bg-stone-900">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
              Selecionadas ({value.length}
              {limit ? `/${limit}` : ''})
            </span>
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-xs font-medium text-stone-400 hover:text-rose-500"
            >
              Limpar tudo
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {value.map((c) => (
              <span
                key={cityKey(c)}
                className="inline-flex items-center gap-1 rounded-full bg-sky-50 py-1 pl-2.5 pr-1 text-xs font-medium text-sky-700 dark:bg-sky-500/15 dark:text-sky-300"
              >
                <MapPin size={11} className="opacity-70" />
                {c.name}
                <span className="text-sky-400">{c.state}</span>
                <button
                  type="button"
                  onClick={() => onChange(value.filter((x) => cityKey(x) !== cityKey(c)))}
                  className="grid h-4 w-4 place-items-center rounded-full hover:bg-sky-200/60 dark:hover:bg-sky-500/30"
                  aria-label={`Remover ${c.name}`}
                >
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {atLimit && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          Limite de {limit} cidades atingido. Para remover, toque no × de uma cidade selecionada.
        </p>
      )}
    </div>
  )
}

function CityRow({ city, selected, disabled, onToggle, subtitle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={cx(
        'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors',
        selected
          ? 'bg-sky-50 text-sky-800 dark:bg-sky-500/15 dark:text-sky-200'
          : disabled
            ? 'cursor-not-allowed text-stone-300 dark:text-stone-600'
            : 'text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800',
      )}
    >
      <span
        className={cx(
          'grid h-4 w-4 shrink-0 place-items-center rounded border transition-colors',
          selected ? 'border-sky-500 bg-sky-500 text-white' : 'border-stone-300 dark:border-stone-600',
        )}
      >
        {selected && <Check size={11} />}
      </span>
      <span className="min-w-0 flex-1 truncate">
        {city.name}
        {subtitle && <span className="ml-1 text-[11px] text-stone-400">· {subtitle}</span>}
      </span>
    </button>
  )
}
