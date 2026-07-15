'use client'
import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

// Tipagem simples para o TypeScript
interface Presente {
  id: string
  nome: string
  link_compra: string | null
  imagem_url: string
  reservado_por: string[]
  reservado: boolean
  descricao?: string
}

export default function Home() {
  const [presentes, setPresentes] = useState<Presente[]>([])
  const [loading, setLoading] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [presenteSelecionado, setPresenteSelecionado] = useState<string | null>(null)
  const [confirmando, setConfirmando] = useState(false)
  const [nome, setNome] = useState('')
  const [tipoAcao, setTipoAcao] = useState<'reserva' | 'contribuicao'>('reserva')
  const pixSectionRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    carregarPresentes()
  }, [])

  async function carregarPresentes() {
    try {
      const { data } = await supabase
        .from('presentes')
        .select('*')
        .order('nome', { ascending: true })
      
      if (data) {
        // Garante que cada presente tem os campos necessários
        const presentesFormatados = (data as Presente[]).map((p) => ({
          ...p,
          reservado_por: Array.isArray(p.reservado_por) ? p.reservado_por : [],
          reservado: p.reservado || false
        }))
        setPresentes(presentesFormatados)
      }
    } catch (error) {
      console.error('Erro ao carregar presentes:', error)
    }
    setLoading(false)
  }

  function acessarProduto(url: string | null) {
    if (!url) return
    window.open(url, '_blank')
  }

  function abrirModal(id: string, tipo: 'reserva' | 'contribuicao') {
    setPresenteSelecionado(id)
    setTipoAcao(tipo)
    setNome('')
    
    if (tipo === 'contribuicao') {
      // Para contribuição, scroll até a seção de PIX e depois abre o modal
      if (pixSectionRef.current) {
        pixSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
        // Abre o modal após o scroll (750ms para deixar o scroll terminar)
        setTimeout(() => {
          setModalAberto(true)
        }, 750)
      }
    } else {
      // Para reserva, abre o modal imediatamente
      setModalAberto(true)
    }
  }

  function confirmarAcao() {
    if (!presenteSelecionado || !nome.trim()) {
      alert('Por favor, digite seu nome')
      return
    }
    
    setConfirmando(true)
    
    const presenteIndex = presentes.findIndex(p => p.id === presenteSelecionado)
    if (presenteIndex === -1) {
      setConfirmando(false)
      return
    }

    const novasPresentes = [...presentes]
    const presente = novasPresentes[presenteIndex]

    if (tipoAcao === 'reserva') {
      // Para reserva, apenas uma pessoa - substitui a lista
      presente.reservado_por = [nome.trim()]
      presente.reservado = true
    } else {
      // Para contribuição, adiciona ao final da lista
      if (!presente.reservado_por.includes(nome.trim())) {
        presente.reservado_por.push(nome.trim())
      } else {
        alert('Você já está contribuindo para este presente!')
        setConfirmando(false)
        return
      }
    }

    salvarNoSupabase(presente)
  }

  async function salvarNoSupabase(presente: Presente) {
    try {
      const updateData = { reservado_por: presente.reservado_por }
      
      // Se for reserva, também atualiza o campo 'reservado'
      if (tipoAcao === 'reserva') {
        updateData.reservado = presente.reservado
      }
      
      const { error } = await supabase
        .from('presentes')
        .update(updateData)
        .eq('id', presente.id)

      setConfirmando(false)
      
      if (!error) {
        const mensagem = tipoAcao === 'reserva' 
          ? "Presente reservado com sucesso!"
          : "Obrigado por contribuir!"
        alert(mensagem)
        cancelarModal()
        carregarPresentes()
      } else {
        alert("Erro ao salvar. Tente novamente.")
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert("Erro ao salvar. Tente novamente.")
      setConfirmando(false)
    }
  }

  function cancelarModal() {
    setModalAberto(false)
    setPresenteSelecionado(null)
    setNome('')
    setTipoAcao('reserva')
  }

  if (loading) return (
    <div className="flex h-screen items-center justify-center font-light tracking-widest text-gray-400">
      CARREGANDO...
    </div>
  )

  return (
    <div style={{ 
      position: 'relative', 
      minHeight: '100vh', 
      backgroundColor: '#F7F7F2' 
    }}>
      
      {/* MODAL DE CONFIRMAÇÃO */}
      {modalAberto && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
          <div className="bg-white rounded-sm shadow-lg p-8 max-w-md w-11/12" style={{ backgroundColor: '#F7F7F2', borderTop: '2px solid #8C8681' }}>
            <h2 className="text-lg font-serif text-stone-700 tracking-wide mb-4 text-center">
              {tipoAcao === 'reserva' ? 'Reservar Presente' : 'Contribuir'}
            </h2>
            
            <div className="space-y-4 mb-8 text-sm leading-relaxed text-stone-600">
              <p>
                <span className="font-semibold">
                  {tipoAcao === 'reserva' 
                    ? 'Se você reservar este presente, ele ficará INDISPONÍVEL para os outros convidados.'
                    : 'Você deseja contribuir para este presente. Você e outras pessoas podem estar nesta lista.'}
                </span>
              </p>
              <p className="text-[12px] text-stone-500">
                Endereço de entrega: Av. Comendador Firmino Alves, nº 308, apto 801 - Centro • CEP 45600185 • Itabuna-BA.
              </p>
              <div className="border-l-2 border-stone-300 pl-4 py-2 bg-stone-50">
                <p className="text-stone-700">
                  {tipoAcao === 'reserva'
                    ? 'Para cancelar reserva ou fazer alterações, você precisará entrar em contato diretamente com os noivos.'
                    : 'Para remover sua contribuição, entre em contato com os noivos.'}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-stone-200">
                <label className="block text-sm font-semibold text-stone-700 mb-2">
                  {tipoAcao === 'reserva' ? 'Seu nome (quem está dando o presente):' : 'Seu nome:'}
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Digite seu nome"
                  className="w-full px-3 py-2 border border-stone-300 rounded-sm text-stone-700 text-sm focus:outline-none focus:border-stone-700"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={cancelarModal}
                disabled={confirmando}
                className="px-6 py-2 text-[10px] tracking-[0.3em] uppercase border border-stone-800 text-stone-800 hover:bg-stone-100 transition-all disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarAcao}
                disabled={confirmando || !nome.trim()}
                className="px-6 py-2 text-[10px] tracking-[0.3em] uppercase bg-stone-800 text-white hover:bg-stone-600 transition-all disabled:opacity-50"
              >
                {confirmando ? (tipoAcao === 'reserva' ? "Reservando..." : "Contribuindo...") : (tipoAcao === 'reserva' ? "Confirmar Reserva" : "Confirmar Contribuição")}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* IMAGEM DE FUNDO */}
      <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 0, 
          backgroundImage: 'url("/fundo.png")',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          opacity: 0.12, 
          display: 'block',
          pointerEvents: 'none'
      }} />

      {/* CONTEÚDO */}
      <div className="min-h-screen bg-transparent text-[#333] font-sans selection:bg-stone-200" style={{ position: 'relative', zIndex: 1 }}>
        
        <header className="relative flex flex-col items-center justify-center pt-20 pb-16 px-4">
           <h1 style={{ 
              fontFamily: 'var(--font-custom), serif', 
              color: '#8C8681', 
              fontSize: 'clamp(2rem, 8vw, 5rem)', 
              marginBottom: '1rem',
              fontStyle: 'italic',
              fontWeight: 'normal',
              textAlign: 'center'
            }}>
          Lucas e Bella
        </h1>
        <div className="w-12 h-[1px] bg-stone-300 mb-6"></div>
        <p className="text-xs tracking-[0.4em] uppercase text-stone-500 text-center max-w-xl leading-loose">
          Celebrar com você já é um presente! Mas deixamos algumas ideias para quem quiser contribuir com nosso novo lar! <br/>
          
        </p>
      </header>

      {/* GRID DE PRESENTES */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
          {presentes.map((item) => (
            <div 
              key={item.id} 
              className="group flex flex-col items-center text-center space-y-4"
            >
              {/* Container da Imagem */}
              <div className="relative w-full aspect-square overflow-hidden bg-stone-50 border border-stone-100 p-8">
                <img 
                  src={item.imagem_url} 
                  alt={item.nome}
                  className={`w-full h-full object-contain mix-multiply transition-all duration-700 ${
                    item.reservado && item.link_compra !== 'PIX' ? 'opacity-30 grayscale' : 'group-hover:scale-105'
                  }`}
                />
                {item.reservado && item.link_compra !== 'PIX' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-white/80 px-4 py-1 text-[10px] tracking-[0.2em] uppercase text-stone-400">
                      Já Escolhido
                    </span>
                  </div>
                )}
              </div>

              {/* Info do Presente */}
              <div className="space-y-1">
                <h2 className="text-lg font-serif text-stone-700 tracking-wide uppercase">
                  {item.nome}
                </h2>
                {item.link_compra === null && (
                  <p className="text-[11px] text-stone-400 uppercase tracking-widest leading-relaxed">
                    a critério do convidado
                  </p>
                )}
                

              </div>

              {/* Botões */}
              <div className="flex gap-3 justify-center">
                {item.link_compra && item.link_compra !== 'PIX' && (
                <button
                  onClick={() => acessarProduto(item.link_compra)}
                  className="px-6 py-2 text-[10px] tracking-[0.3em] uppercase transition-all duration-300 border border-stone-800 text-stone-800 hover:bg-stone-100"
                >
                  Acessar Produto
                </button>
              )}

              <button
                onClick={() => item.link_compra === 'PIX' ? abrirModal(item.id, 'contribuicao') : abrirModal(item.id, 'reserva')}
                disabled={item.reservado && item.link_compra !== 'PIX'}
                className={`px-6 py-2 text-[10px] tracking-[0.3em] uppercase transition-all duration-300 ${
                  item.link_compra === 'PIX'
                    ? 'bg-stone-800 text-white hover:bg-stone-600 border border-stone-800'
                    : item.reservado
                      ? 'text-stone-300 cursor-not-allowed border border-stone-300'
                      : 'bg-stone-800 text-white hover:bg-stone-600 border border-stone-800'
                }`}
              >
                {item.link_compra === 'PIX'
                  ? 'Contribuir'
                  : item.reservado
                    ? 'Indisponível'
                    : 'Reservar'}
              </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SEÇÃO DE ENDEREÇO */}
      <section className="max-w-4xl mx-auto px-6 mb-6 text-center">
        <div className="inline-flex flex-col items-center text-center bg-[#E2E8DD] border border-[#D3DDD1] p-10 rounded-2xl shadow-sm max-w-8xl w-full">
          
          <h3 className="text-base tracking-[0.2em] uppercase text-stone-650 mb-4 font-semibold">
            Endereço para Entrega
          </h3>

          <p className="text-base text-stone-700 leading-relaxed max-w-2xl font-medium">
            Av. Comendador Firmino Alves, nº 308, apto 801 - Centro • CEP 45600185 • Itabuna-BA
          </p>
          
        </div>
      </section>

      {/* SEÇÃO DE PIX */}
      <section ref={pixSectionRef} className="max-w-5xl mx-auto px-6 py-10 mb-10">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-12 bg-white bg-opacity-60 p-8 rounded-sm border border-stone-200">
          {/* Texto com Informações do PIX */}
          <div className="flex-1 space-y-4">
            <h3 className="text-lg font-serif text-stone-700 tracking-wide uppercase mb-6">
              Se preferir contribuir
            </h3>
            <div className="space-y-3 text-sm text-stone-600 leading-relaxed">
              <p className="font-semibold text-stone-700">
                Chave PIX: <span className="font-mono text-[13px] text-stone-500">73981690015</span>
              </p>
              <p>
                <span className="font-semibold">Beneficiário:</span> Bella Romana Da Luz Mattos Baracat Habib
              </p>
              <p className="text-[12px] text-stone-500">
                Mercado Pago
              </p>
              <p className="italic text-stone-500 pt-2 border-t border-stone-200">
                Para quem prefere contribuir sem escolher um dos presentes da lista, com o aplicativo de seu banco escaneie o QR code ao lado (ou insira a chave) e realize sua transferência.
              </p>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex-shrink-0">
            <div className="bg-white p-4 border border-stone-200 rounded-sm">
              <img 
                src="/qrcode.jpeg" 
                alt="QR Code PIX" 
                className="w-40 h-40 object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER - Infos do Evento */}
      <footer className="border-t border-stone-100 py-16 text-center space-y-4">
        <p className="text-[11px] tracking-[0.3em] uppercase text-stone-400">
          10 | Outubro | 2026
        </p>
        <p className="text-[10px] tracking-[0.2em] uppercase text-stone-400">
          Às 20h, AABB - Itabuna, BA
        </p>
      </footer>

    </div>
  </div>
  )
}