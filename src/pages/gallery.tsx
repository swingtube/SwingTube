import { useState, useEffect } from 'react'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import axios from 'axios';


type SheetRecord = {
  title: string
  month: string
  year: string
  thumbnail: string
  url?: string        // URL del video (mp4, o embed)
}

export function SelectScrollable() {
    const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSk4ZnURJYtb9-fFek4YesRUa30TMZIlh5Kh_VgWcW-mFRfi4cBTgZnECp4ORAia44CVDw9g5L7CFJ1/pub?gid=0&single=true&output=csv';

    const [sheetData, setSheetData] = useState<SheetRecord[]>([])
    const [month, setMonth] = useState<number>(new Date().getMonth() + 1)
    const [year, setYear] = useState<number>(new Date().getFullYear())
    const [results, setResults] = useState<SheetRecord[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    // 1. Parse CSV text into objetos
  const parseCSV = (csvText: string): SheetRecord[] => {
    const rows = csvText
      .split(/\r?\n/)
      .filter((row) => row.trim() !== '')
    if (rows.length < 2) return []

    const headers = rows[0].split(',').map((h) => h.trim())
    return rows.slice(1).map((r) => {
      const cols = r.split(',')
      const obj: any = {}
      headers.forEach((h, i) => {
        obj[h] = cols[i]?.trim() ?? ''
      })
      return obj as SheetRecord
    })
  }

  // 2. Cargar sheetData al montar
  useEffect(() => {
    const fetchCSVData = async () => {
      try {
        const resp = await axios.get<string>(CSV_URL)
        const data = parseCSV(resp.data)
        setSheetData(data)
      } catch (err) {
        console.error(err)
        setError(
          'No se han podido cargar los datos. Comprueba que la hoja está publicada como CSV y que la URL es correcta.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchCSVData()
  }, [])

  // 3. Filtrar cada vez que cambian mes, año o sheetData
  useEffect(() => {
    if (!loading && !error) {
      const filtered = sheetData.filter(
        (rec) =>
          Number(rec.month) === month && Number(rec.year) === year
      )
      setResults(filtered)
    }
  }, [month, year, sheetData, loading, error])

  // Generar arrays para los selects
  const months = Array.from({ length: 12 }, (_, i) => i + 1)
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

  if (loading) {
    return (
      <div className="text-center p-8">Cargando datos...</div>
    )
  }
  if (error) {
    return (
      <div className="text-red-600 border border-red-400 p-4 m-4 text-center">
        {error}
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6">
      {/* Buscador */}
      <h1 className='text-xl md:text-5xl font-bold tracking-tight'>Buscar</h1>
      <div className="flex flex-wrap gap-4 items-end justify-center">
        <div>
          <label className="block mb-1 text-sm font-medium">Mes</label>
          <Select
            defaultValue={String(month)}
            onValueChange={(v) => setMonth(Number(v))}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Mes" />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m} value={String(m)}>
                  {new Date(0, m - 1).toLocaleString('es-ES', {
                    month: 'long',
                  })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium">Año</label>
          <Select
            defaultValue={String(year)}
            onValueChange={(v) => setYear(Number(v))}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Año" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Resultados */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.length === 0 ? (
          <p className="col-span-full text-center text-muted-foreground">
            No hay videos del {month}/{year}
          </p>
        ) : (
          results.map((rec) => (
            <Card key={rec.title}>
              <CardHeader>
                <CardTitle>{rec.title}</CardTitle>
                <CardDescription>
                  {rec.month}/{rec.year}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {rec.url ? (
                  // Si es un MP4
                  rec.url.endsWith('.mp4') ? (
                    <video
                      controls
                      className="w-full rounded-lg shadow"
                    >
                      <source src={rec.url} type="video/mp4" />
                      Tu navegador no soporta video.
                    </video>
                  ) : (
                    // Asume embed YouTube
                    <div className="aspect-video">
                      <iframe
                        className="w-full h-full rounded-lg shadow"
                        src={rec.url}
                        title={rec.title}
                        // frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )
                ) : (
                  <p>{rec.title}</p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
    )
}
