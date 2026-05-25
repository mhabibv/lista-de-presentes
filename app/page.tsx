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

  async function reservar(id: string, url: string) {
    const confirmacao = confirm("Deseja reservar este presente? Ele ficará indisponível para outros convidados.")
    
    if (confirmacao) {
      const { error } = await supabase
        .from('presentes')
        .update({ reservado: true })
        .eq('id', id)

      if (!error) {
        window.open(url, '_blank')
        fetchPresentes()
      } else {
        alert("Erro ao reservar. Tente novamente.")
      }
    }
  }

  if (loading) return (
    <div className="flex h-screen items-center justify-center font-light tracking-widest text-gray-400">
      CARREGANDO...
    </div>
  )

  return (
    <div className="min-h-screen bg-[#fdfdfd] text-[#333] font-sans selection:bg-stone-200">
      
      {/* HEADER - Estética do Convite */}
      <header className="relative flex flex-col items-center justify-center pt-20 pb-16 px-4 overflow-hidden">
        {/* Flor decorativa de fundo (opcional, simula o convite) */}
        <div className="absolute top-0 right-0 w-64 h-64 opacity-10 pointer-events-none translate-x-20 -translate-y-10">
          <img src="https://www.transparentpng.com/download/floral/white-flower-decoration-png-21.png" alt="decor" />
        </div>

        <span className="text-sm tracking-[0.3em] text-stone-400 mb-4 uppercase">LB</span>
        <h1 className="text-6xl md:text-8xl font-serif text-stone-800 mb-4 italic">
          Lucas e Bella
        </h1>
        <div className="w-12 h-[1px] bg-stone-300 mb-6"></div>
        <p className="text-xs tracking-[0.4em] uppercase text-stone-500 text-center max-w-md leading-loose">
          Com a bênção de Deus e de seus pais <br/>
          Convidam para sua lista de presentes
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
                  {item.descricao || 'Item sugerido para nossa casa'}
                </p>
              </div>

              {/* Botão */}
              <button
                disabled={item.reservado}
                onClick={() => reservar(item.id, item.link_compra)}
                className={`px-8 py-3 text-[10px] tracking-[0.3em] uppercase transition-all duration-300 ${
                  item.reservado 
                  ? 'text-stone-300 cursor-not-allowed' 
                  : 'bg-stone-800 text-white hover:bg-stone-600'
                }`}
              >
                {item.reservado ? 'Indisponível' : 'Presentear'}
              </button>
            </div>
          ))}
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
  )
}