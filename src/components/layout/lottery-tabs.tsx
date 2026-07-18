import { Link, useLocation } from 'react-router-dom'

interface Aba {
  id: string
  caminho: string
  rotulo: string
}

// Abas disponíveis no hub multi-loterias.
const ABAS: readonly Aba[] = [
  { id: 'megasena', caminho: '/megasena', rotulo: 'Mega-Sena' },
  { id: 'lotofacil', caminho: '/lotofacil', rotulo: 'Lotofácil' },
]

function abaAtiva(pathname: string, caminho: string): boolean {
  return pathname === caminho || pathname.startsWith(`${caminho}/`)
}

/**
 * Navegação em abas entre as loterias do hub.
 * - Destaca a aba ativa conforme a rota atual.
 * - Usa React Router para navegação sem recarregamento.
 * - Atributos ARIA para acessibilidade: tablist, tab, aria-selected.
 */
export function LotteryTabs() {
  const { pathname } = useLocation()

  return (
    <nav className="lottery-tabs" aria-label="Loterias">
      <ul className="lottery-tabs__list" role="tablist">
        {ABAS.map((aba) => {
          const ativa = abaAtiva(pathname, aba.caminho)
          return (
            <li key={aba.id} className="lottery-tabs__item" role="presentation">
              <Link
                to={aba.caminho}
                className={`lottery-tabs__tab ${ativa ? 'lottery-tabs__tab--active' : ''}`}
                role="tab"
                aria-selected={ativa}
                aria-current={ativa ? 'page' : undefined}
              >
                {aba.rotulo}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
