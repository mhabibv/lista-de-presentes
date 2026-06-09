'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Tipagem simples para o TypeScript
interface Presente {
  id: string
  nome: string
  link_compra: string
  imagem_url: string
  reservado: boolean
  descricao?: string
}

export default function Home() {
  const [presentes, setPresentes] = useState<Presente[]>([])
  const [loading, setLoading] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [presenteSelecionado, setPresenteSelecionado] = useState<string | null>(null)
  const [confirmando, setConfirmando] = useState(false)

  async function fetchPresentes() {
    const { data } = await supabase
      .from('presentes')
      .select('*')
      .order('nome', { ascending: true })
    if (data) setPresentes(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchPresentes()
  }, [])

  function acessarProduto(url: string) {
    window.open(url, '_blank')
  }

  async function reservar(id: string) {
    setPresenteSelecionado(id)
    setModalAberto(true)
  }

  async function confirmarReserva() {
    if (!presenteSelecionado) return
    
    setConfirmando(true)
    const { error } = await supabase
      .from('presentes')
      .update({ reservado: true })
      .eq('id', presenteSelecionado)

    setConfirmando(false)
    
    if (!error) {
      alert("Presente reservado com sucesso!")
      setModalAberto(false)
      setPresenteSelecionado(null)
      fetchPresentes()
    } else {
      alert("Erro ao reservar. Tente novamente.")
    }
  }

  function cancelarReserva() {
    setModalAberto(false)
    setPresenteSelecionado(null)
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
              Confirmar Reserva
            </h2>
            
            <div className="space-y-4 mb-8 text-sm leading-relaxed text-stone-600">
              <p>
                <span className="font-semibold">Se você reservar este presente,</span> ele ficará <span className="font-semibold">INDISPONÍVEL</span> para os outros convidados.
              </p>
              
              <div className="border-l-2 border-stone-300 pl-4 py-2 bg-stone-50">
                <p className="text-stone-700">
                  Para <span className="font-semibold">desreservar</span> ou fazer alterações, você precisará entrar em contato diretamente com os noivos.
                </p>
              </div>

              <p className="text-center text-stone-500 italic text-xs">
                Tem certeza que deseja continuar?
              </p>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={cancelarReserva}
                disabled={confirmando}
                className="px-6 py-2 text-[10px] tracking-[0.3em] uppercase border border-stone-800 text-stone-800 hover:bg-stone-100 transition-all disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarReserva}
                disabled={confirmando}
                className="px-6 py-2 text-[10px] tracking-[0.3em] uppercase bg-stone-800 text-white hover:bg-stone-600 transition-all disabled:opacity-50"
              >
                {confirmando ? "Reservando..." : "Confirmar Reserva"}
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
                    item.reservado ? 'opacity-30 grayscale' : 'group-hover:scale-105'
                  }`}
                />
                {item.reservado && (
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
                <p className="text-[11px] text-stone-400 uppercase tracking-widest leading-relaxed">
                </p>
              </div>

              {/* Botões */}
              <div className="flex gap-3 justify-center">
                {/* Botão: Acessar Produto */}
                <button
                  onClick={() => acessarProduto(item.link_compra)}
                  className="px-6 py-2 text-[10px] tracking-[0.3em] uppercase transition-all duration-300 border border-stone-800 text-stone-800 hover:bg-stone-100"
                >
                  Acessar Produto
                </button>

                {/* Botão: Reservar */}
                <button
                  disabled={item.reservado}
                  onClick={() => reservar(item.id)}
                  className={`px-6 py-2 text-[10px] tracking-[0.3em] uppercase transition-all duration-300 ${
                    item.reservado 
                    ? 'text-stone-300 cursor-not-allowed border border-stone-300' 
                    : 'bg-stone-800 text-white hover:bg-stone-600 border border-stone-800'
                  }`}
                >
                  {item.reservado ? 'Indisponível' : 'Reservar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SEÇÃO DE ENDEREÇO - agora depois dos presentes e centralizada */}
      <section className="max-w-4xl mx-auto px-6 mb-3 text-center">
        <div className="inline-flex flex-col items-center text-center">
          <h3 className="text-sm tracking-[0.2em] uppercase text-stone-500 mb-3 font-semibold">
            Endereço para Entrega
          </h3>
          <p className="text-xs text-stone-400 leading-relaxed max-w-2xl">
            Av. Comendador Firmino Alves, nº 308, apto 801 - Centro • CEP 45600185 • Itabuna-BA
          </p>
        </div>
      </section>

      {/* SEÇÃO DE PIX */}
      <section className="max-w-5xl mx-auto px-6 py-10 mb-10">
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
          Às 19h30, na Casa Guasti - Itabuna, BA
        </p>
      </footer>

    </div>
  </div>
  )
}